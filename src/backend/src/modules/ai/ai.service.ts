import { Injectable } from '@nestjs/common';
import { ProblemPatternService } from '../learning/problem-pattern/problem-pattern.service';
import { SimulationTemplateService } from '../learning/simulation-template/simulation-template.service';
import { TheoryChunkService } from '../learning/theory-chunk/theory-chunk.service';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';
import { ChatRequestDto } from './dto/chat-request.dto';
import {
  LlmAnswerDetected,
  LlmAnswerService,
} from './llm-answer.service';
import { LlmService } from './llm.service';
import { RagReference, RagRetrievalService } from './rag-retrieval.service';
import {
  AiAnalysisOutput,
  AiAnswer,
  AiGivenValue,
  AiIntent,
  AiSimulation,
} from './types/ai-analysis-output.types';

type ProblemPattern = Awaited<
  ReturnType<ProblemPatternService['findByTopic']>
>[number];

type TheoryChunk = Awaited<
  ReturnType<TheoryChunkService['findByTopic']>
>[number];

type RagContextChunk = {
  id: string;
  title?: string;
  text: string;
  topic?: string;
  source?: unknown;
  metadata?: object;
};

@Injectable()
export class AiService {
  constructor(
    private readonly problemPatternService: ProblemPatternService,
    private readonly simulationTemplateService: SimulationTemplateService,
    private readonly theoryChunkService: TheoryChunkService,
    private readonly llmService: LlmService,
    private readonly llmAnswerService: LlmAnswerService,
    private readonly ragRetrievalService: RagRetrievalService,
  ) {}

  async analyze(request: AnalyzeRequestDto): Promise<AiAnalysisOutput> {
    const message = request.message.trim();
    const subject = request.subject ?? 'physics';
    const topic = this.detectTopic(message);
    const intent = this.detectIntent(message);
    const given = this.extractGivenValues(message);
    const target = this.extractTarget(message);

    const patterns = await this.findPatternsForTopic(topic, message);
    const selectedPattern = this.selectPattern(message, target, patterns);
    const simulationTemplate = selectedPattern?.simulationId
      ? await this.simulationTemplateService.findById(
          selectedPattern.simulationId,
        )
      : undefined;
    const ragChunks = await this.findRelevantTheoryChunks(
      message,
      topic,
      selectedPattern?.name,
      subject,
      request.grade ?? 11,
    );

    const concepts =
      selectedPattern?.metadata?.conceptKeys ?? this.defaultConcepts(topic);
    const skills =
      selectedPattern?.metadata?.skillKeys ?? this.defaultSkills(target);
    let answer = this.buildAnswer(message, given, target, selectedPattern);
    const simulation = simulationTemplate
      ? this.buildSimulation(simulationTemplate, given)
      : undefined;

    answer = await this.enhanceAnswerWithLlmIfUseful({
      message,
      topic,
      intent,
      answer,
      selectedPattern,
      ragChunks,
    });
    answer = this.enhanceAnswerWithLocalPhysicsIfUseful({
      message,
      topic,
      answer,
      selectedPattern,
      ragChunks,
    });

    return {
      intent,
      subject,
      topic,
      confidence: selectedPattern ? 0.86 : 0.58,
      analysis: {
        concepts,
        skills,
        given,
        target,
        pattern_id: selectedPattern?.patternId,
      },
      answer,
      simulation,
      render_blocks: this.buildRenderBlocks(
        answer.steps.length > 0,
        simulation,
      ),
      references: this.toReferences(ragChunks),
    };
  }

  async chat(request: ChatRequestDto) {
    const message = request.message.trim();
    const subject = request.subject ?? 'physics';
    const grade = request.grade ?? 11;
    const topic = this.detectTopic(message);
    const intent = this.detectIntent(message);
    const ragChunks = await this.ragRetrievalService.retrieveTheoryChunks({
      message,
      subject,
      grade,
      topic,
      simulationId: request.simulationId,
    });
    const patterns = await this.findPatternsForTopic(topic, message);
    const selectedPattern = this.selectPattern(
      message,
      this.extractTarget(message),
      patterns,
    );
    const simulationTemplate = request.simulationId
      ? await this.simulationTemplateService.findById(request.simulationId)
      : selectedPattern?.simulationId
        ? await this.simulationTemplateService.findById(
            selectedPattern.simulationId,
          )
        : undefined;
    const detectedAnswer = this.buildLlmAnswerDetected({
      message,
      subject,
      grade,
      topic,
      intent,
      hasSimulation: Boolean(request.simulationId || simulationTemplate),
      hasContext: Boolean(request.context?.length),
    });
    const llmInput = {
      question: message,
      detected: detectedAnswer,
      references: ragChunks,
      simulation: {
        simulationId: request.simulationId ?? simulationTemplate?.simulationId,
        available: Boolean(simulationTemplate),
        templateTitle: simulationTemplate?.title,
        parameters: this.readSimulationParameters(simulationTemplate),
      },
      userContext: {
        session_id: request.session_id,
        student_level: request.student_level,
        preferred_style: request.preferred_style,
        recent_messages: request.context ?? [],
      },
    };
    const llmAnswer = await this.llmAnswerService.generate(llmInput);

    const fallbackAnswer = llmAnswer
      ? undefined
      : this.buildLocalChatFallback(message, topic, ragChunks, selectedPattern);
    const answer = llmAnswer?.answer ?? fallbackAnswer ?? '';
    if (!llmAnswer) {
      await this.llmAnswerService.logLocalFallback(llmInput, answer);
    }
    const fallbackMetadata = {
      llmEnabled: false,
      model: this.llmAnswerService.getModel(),
      retrievalTopK: ragChunks.length,
      promptTokensApprox: 0,
      latencyMs: 0,
    };
    const debug = this.shouldIncludeChatDebug()
      ? {
          debug: {
            retrievalTopK: 5,
            referenceCount: ragChunks.length,
            hasVectorResults: ragChunks.some(
              (reference) => reference.vectorScore !== undefined,
            ),
            hasKeywordResults: ragChunks.some(
              (reference) => reference.keywordScore !== undefined,
            ),
          },
        }
      : {};

    return {
      intent,
      subject,
      grade,
      topic,
      session_id: request.session_id,
      answer,
      steps: llmAnswer?.steps ?? [],
      formulae: llmAnswer?.formulae ?? [],
      simulation_hint: llmAnswer?.simulation_hint,
      used_reference_ids: llmAnswer?.used_reference_ids ?? [],
      confidence: llmAnswer?.confidence ?? 'medium',
      needs_more_context: llmAnswer?.needs_more_context ?? false,
      safety_notes: llmAnswer?.safety_notes ?? [],
      metadata: llmAnswer?.metadata ?? fallbackMetadata,
      used_llm: Boolean(llmAnswer),
      simulation: simulationTemplate
        ? this.buildSimulation(simulationTemplate, [])
        : undefined,
      references: ragChunks,
      ...debug,
    };
  }

  private buildLlmAnswerDetected(input: {
    message: string;
    subject: string;
    grade: number;
    topic: string;
    intent: AiIntent;
    hasSimulation: boolean;
    hasContext: boolean;
  }): LlmAnswerDetected {
    const normalized = this.normalize(input.message);
    let answerIntent: LlmAnswerDetected['intent'] = 'unknown';

    if (input.hasContext && this.hasAny(normalized, ['vay', 'no', 'cai do', 'lien he'])) {
      answerIntent = 'follow_up';
    } else if (input.hasSimulation || this.hasAny(normalized, ['mo phong', 'keo', 'tham so'])) {
      answerIntent = 'simulation_guidance';
    } else if (input.intent === 'solve_and_simulate' || this.hasAny(normalized, ['tinh', 'tim', 'thay so'])) {
      answerIntent = 'solve_problem';
    } else if (
      this.hasAny(normalized, [
        'cong thuc',
        'phuong trinh',
        'omega',
        'tan so goc',
        'phi',
        'ky hieu',
        'ki hieu',
        'lien he',
      ])
    ) {
      answerIntent = 'formula_explain';
    } else if (input.intent === 'explain' || this.hasAny(normalized, ['la gi', 'the nao', 'dinh nghia'])) {
      answerIntent = 'concept_explain';
    }

    return {
      intent: answerIntent,
      subject: input.subject,
      grade: input.grade,
      topic: input.topic,
      difficulty: this.detectDifficulty(normalized),
    };
  }

  private detectDifficulty(normalizedMessage: string): 'basic' | 'medium' | 'advanced' {
    if (this.hasAny(normalizedMessage, ['chung minh', 'suy ra', 'nang cao'])) {
      return 'advanced';
    }

    if (this.hasAny(normalizedMessage, ['tinh', 'tim', 'phuong trinh', 'cong thuc'])) {
      return 'medium';
    }

    return 'basic';
  }

  private detectIntent(message: string): AiIntent {
    const normalized = this.normalize(message);
    const asksSimulation = this.hasAny(normalized, [
      'mo phong',
      'simulate',
      'hinh anh',
      'do thi',
    ]);
    const asksSolve = this.hasAny(normalized, [
      'tinh',
      'tim',
      'giai',
      'xac dinh',
      'bao nhieu',
      'lap phuong trinh',
    ]);
    const asksExplain = this.hasAny(normalized, [
      'giai thich',
      'tai sao',
      'vi sao',
      'la gi',
      'the nao',
      'khi nao',
    ]);

    if (asksSolve) {
      return 'solve_and_simulate';
    }

    if (asksSimulation) {
      return 'simulate';
    }

    if (asksExplain) {
      return 'explain';
    }

    return 'chat';
  }

  private detectTopic(message: string) {
    const normalized = this.normalize(message);

    if (
      this.hasAny(normalized, [
        'cong huong',
        'tan so rieng',
        'tan so cuong buc',
      ])
    ) {
      return 'resonance';
    }

    if (this.hasAny(normalized, ['cuong buc', 'ngoai luc tuan hoan'])) {
      return 'forced_oscillation';
    }

    if (this.hasAny(normalized, ['tat dan', 'luc can', 'ma sat'])) {
      return 'damped_oscillation';
    }

    if (this.hasAny(normalized, ['con lac don', 'chieu dai day treo'])) {
      return 'simple_pendulum';
    }

    if (
      this.hasAny(normalized, [
        'co nang',
        'dong nang',
        'the nang',
        'nang luong',
      ])
    ) {
      return 'shm_energy';
    }

    if (
      this.hasAny(normalized, ['van toc', 'gia toc', 'vmax', 'amax', 'xva'])
    ) {
      return 'shm_kinematics';
    }

    if (
      this.hasAny(normalized, ['con lac lo xo', 'do cung', 'lo xo']) &&
      this.hasAny(normalized, ['chu ki', 'chu ky', 'tan so'])
    ) {
      return 'spring_oscillator';
    }

    if (
      this.hasAny(normalized, [
        'dao dong dieu hoa',
        'chu ki',
        'chu ky',
        'tan so goc',
        'bien do',
        'li do',
        'pha',
        'phuong trinh dao dong',
      ])
    ) {
      return 'simple_harmonic_motion';
    }

    if (this.hasAny(normalized, ['dao dong co', 'vi tri can bang'])) {
      return 'mechanical_oscillation';
    }

    return 'unknown';
  }

  private extractGivenValues(message: string): AiGivenValue[] {
    const values: AiGivenValue[] = [];
    const equationMatch = message.match(
      /x\s*=\s*([+-]?\d+(?:[,.]\d+)?)\s*(?:cos|sin)\s*\(\s*([+-]?(?:\d+(?:[,.]\d+)?)?)\s*(π|pi|Ï€)?\s*t\s*([+-]\s*(?:π|pi|Ï€)\s*\/\s*\d+|[+-]\s*\d+(?:[,.]\d+)?)?\s*\)\s*(cm|m)?/i,
    );

    if (equationMatch) {
      const amplitude = this.toNumber(equationMatch[1]);
      const omegaCoefficient = equationMatch[2]?.replace(',', '.');
      const omegaText = equationMatch[3]
        ? `${omegaCoefficient || ''}π`
        : omegaCoefficient || '1';
      const omegaValue = this.piTextToNumber(omegaText);
      const phiText = equationMatch[4]
        ?.replace(/\s/g, '')
        .replace(/pi|Ï€/gi, 'π');
      const phiValue = phiText ? this.piTextToNumber(phiText) : undefined;
      const positionUnit = equationMatch[5] ?? 'cm';

      values.push({
        key: 'A',
        value: amplitude,
        unit: positionUnit,
        label: 'Biên độ',
      });
      values.push({
        key: 'omega',
        value: omegaText,
        unit: 'rad/s',
        label: 'Tần số góc',
      });

      if (phiText && phiValue !== undefined && Number.isFinite(phiValue)) {
        values.push({
          key: 'phi',
          value: phiText,
          unit: 'rad',
          label: 'Pha ban đầu',
        });
        values.push({
          key: 'phi_numeric',
          value: Number(phiValue.toFixed(3)),
          unit: 'rad',
          label: 'Pha ban đầu dạng số',
        });
      }

      if (omegaValue !== undefined && Number.isFinite(omegaValue)) {
        values.push({
          key: 'omega_numeric',
          value: Number(omegaValue.toFixed(3)),
          unit: 'rad/s',
          label: 'Tần số góc dạng số',
        });
      }
    }

    const timeMatch = message.match(
      /(?:t|thời điểm|thoi diem)\s*=\s*([+-]?\d+(?:[,.]\d+)?)\s*s/i,
    );

    if (timeMatch) {
      values.push({
        key: 't',
        value: this.toNumber(timeMatch[1]),
        unit: 's',
        label: 'Thời gian',
      });
    }

    return this.dedupeByKey(values);
  }

  private extractTarget(message: string): string[] {
    const normalized = this.normalize(message);

    if (this.hasAny(normalized, ['chu ki', 'chu ky', 'period'])) {
      return ['T'];
    }

    if (this.hasAny(normalized, ['tan so', 'frequency'])) {
      return ['f'];
    }

    if (this.hasAny(normalized, ['li do', 'toa do', 'vi tri'])) {
      return ['x'];
    }

    if (this.hasAny(normalized, ['van toc cuc dai', 'vmax'])) {
      return ['vmax'];
    }

    if (this.hasAny(normalized, ['gia toc cuc dai', 'amax'])) {
      return ['amax'];
    }

    if (this.hasAny(normalized, ['co nang', 'dong nang', 'the nang'])) {
      return ['energy'];
    }

    if (this.hasAny(normalized, ['cong huong'])) {
      return ['resonance_condition'];
    }

    return [];
  }

  private async findPatternsForTopic(topic: string, message: string) {
    if (topic !== 'unknown') {
      const topicPatterns = await this.problemPatternService.findByTopic(topic);

      if (topicPatterns.length > 0) {
        return topicPatterns;
      }
    }

    return this.problemPatternService.search(message);
  }

  private selectPattern(
    message: string,
    target: string[],
    patterns: ProblemPattern[],
  ) {
    const normalized = this.normalize(message);

    if (target.includes('T') || target.includes('f')) {
      return (
        this.findPatternByIds(patterns, [
          'SHM_FIND_PERIOD_FREQUENCY',
          'SPRING_OSCILLATOR_PERIOD',
          'SHM_FIND_PERIOD_FROM_EQUATION',
        ]) ?? patterns[0]
      );
    }

    if (target.includes('x')) {
      return (
        this.findPatternByIds(patterns, ['SHM_POSITION_AT_TIME']) ?? patterns[0]
      );
    }

    if (target.includes('vmax') || target.includes('amax')) {
      return (
        this.findPatternByIds(patterns, [
          'SHM_MAX_VELOCITY_ACCELERATION',
          'SHM_MAX_VELOCITY',
        ]) ?? patterns[0]
      );
    }

    if (target.includes('energy')) {
      return (
        this.findPatternByIds(patterns, [
          'SHM_ENERGY_AT_POSITION',
          'SHM_ENERGY_FROM_VELOCITY',
          'SHM_ENERGY_RATIO',
          'SHM_ENERGY_BASIC',
        ]) ?? patterns[0]
      );
    }

    if (target.includes('resonance_condition')) {
      return (
        this.findPatternByIds(patterns, ['RESONANCE_CONDITION']) ?? patterns[0]
      );
    }

    if (this.hasAny(normalized, ['xac dinh', 'tham so'])) {
      return (
        this.findPatternByIds(patterns, ['SHM_IDENTIFY_PARAMETERS']) ??
        patterns[0]
      );
    }

    return patterns[0];
  }

  private buildAnswer(
    _message: string,
    given: AiGivenValue[],
    target: string[],
    pattern?: ProblemPattern,
  ): AiAnswer {
    const omega = given.find((item) => item.key === 'omega');
    const omegaNumeric = given.find((item) => item.key === 'omega_numeric');

    if (
      target.includes('T') &&
      omega &&
      typeof omegaNumeric?.value === 'number'
    ) {
      const period = (2 * Math.PI) / omegaNumeric.value;

      return {
        short_answer: `Chu kì dao động là T = ${this.formatNumber(period)} s.`,
        steps: [
          `Từ phương trình dao động, ta xác định được omega = ${omega.value} rad/s.`,
          'Áp dụng công thức T = 2π / omega.',
          `Suy ra T = 2π / ${omega.value} = ${this.formatNumber(period)} s.`,
        ],
      };
    }

    if (
      target.includes('f') &&
      omega &&
      typeof omegaNumeric?.value === 'number'
    ) {
      const frequency = omegaNumeric.value / (2 * Math.PI);

      return {
        short_answer: `Tần số dao động là f = ${this.formatNumber(
          frequency,
        )} Hz.`,
        steps: [
          `Từ phương trình, omega = ${omega.value} rad/s.`,
          'Áp dụng f = omega / 2π.',
          `Suy ra f = ${this.formatNumber(frequency)} Hz.`,
        ],
      };
    }

    if (pattern) {
      return {
        short_answer:
          'Đã nhận diện được dạng bài. LLM/RAG sẽ bổ sung lời giải thân thiện hơn nếu đã cấu hình API key.',
        steps: [
          `Dạng bài phù hợp: ${pattern.name}.`,
          `Công thức hoặc hướng xử lí chính: ${
            pattern.mainFormula ?? 'giải thích khái niệm'
          }.`,
        ],
      };
    }

    return {
      short_answer:
        'Chưa tìm thấy dữ liệu khớp thật chắc trong kho chương 1. Nếu đã cấu hình LLM, hệ thống sẽ dùng kiến thức Vật lí 11 để giải thích có kiểm soát.',
      steps: [],
    };
  }

  private buildSimulation(
    template: NonNullable<
      Awaited<ReturnType<SimulationTemplateService['findById']>>
    >,
    given: AiGivenValue[],
  ): AiSimulation {
    const defaultParameters: {
      key: string;
      label: string;
      value: string | number;
      unit?: string;
    }[] = Array.isArray(template.defaultParameters)
      ? template.defaultParameters
      : Object.entries(template.defaultParameters ?? {}).map(
          ([key, value]) => ({
            key,
            label: key,
            value: value as string | number,
          }),
        );
    const params = defaultParameters.map((parameter) => {
      const extracted =
        given.find((item) => item.key === `${parameter.key}_numeric`) ??
        given.find((item) => item.key === parameter.key);

      return {
        key: parameter.key,
        value: extracted?.value ?? parameter.value,
        unit: parameter.unit,
        label: parameter.label ?? parameter.key,
      };
    });

    return {
      simulation_id: template.simulationId,
      title: template.title,
      parameters: params,
    };
  }

  private readSimulationParameters(
    template?: Awaited<ReturnType<SimulationTemplateService['findById']>>,
  ) {
    if (!template) {
      return undefined;
    }

    if (Array.isArray(template.defaultParameters)) {
      return Object.fromEntries(
        template.defaultParameters
          .filter(
            (parameter) =>
              Boolean(parameter) &&
              typeof parameter === 'object' &&
              typeof (parameter as { key?: unknown }).key === 'string',
          )
          .map((parameter) => {
            const record = parameter as { key: string; value?: unknown };
            return [record.key, record.value];
          }),
      );
    }

    return typeof template.defaultParameters === 'object' &&
      template.defaultParameters !== null
      ? (template.defaultParameters as Record<string, unknown>)
      : undefined;
  }

  private buildRenderBlocks(hasAnswer: boolean, simulation?: AiSimulation) {
    return [
      ...(hasAnswer ? [{ type: 'answer_card' as const }] : []),
      { type: 'formula_card' as const },
      ...(simulation ? [{ type: 'simulation_card' as const }] : []),
      { type: 'theory_card' as const },
    ];
  }

  private async findRelevantTheoryChunks(
    message: string,
    topic: string,
    patternName?: string,
    subject = 'physics',
    grade = 11,
  ) {
    const ragChunks = await this.ragRetrievalService.retrieveTheoryChunks({
      message,
      subject,
      grade,
      topic,
    });

    if (ragChunks.length > 0) {
      return ragChunks;
    }

    const chunks = await this.theoryChunkService.searchForRag(message, topic);

    if (chunks.length > 0) {
      return chunks.map((chunk) => this.toRagReference(chunk));
    }

    if (patternName) {
      const patternChunks = await this.theoryChunkService.searchForRag(
        patternName,
        topic,
      );

      if (patternChunks.length > 0) {
        return patternChunks.map((chunk) => this.toRagReference(chunk));
      }
    }

    if (topic !== 'unknown') {
      const topicChunks = await this.theoryChunkService.findByTopic(topic);
      return topicChunks.map((chunk) => this.toRagReference(chunk));
    }

    return [];
  }

  private async enhanceAnswerWithLlmIfUseful(payload: {
    message: string;
    topic: string;
    intent: AiIntent;
    answer: AiAnswer;
    selectedPattern?: ProblemPattern;
    ragChunks: RagContextChunk[];
  }) {
    const shouldUseLlm =
      this.llmService.isConfigured() &&
      ['chat', 'explain', 'solve_and_simulate'].includes(payload.intent) &&
      (payload.answer.steps.length === 0 ||
        payload.answer.short_answer.includes('LLM/RAG') ||
        payload.answer.short_answer.includes('Chưa tìm thấy'));

    if (!shouldUseLlm) {
      return payload.answer;
    }

    const llmText = await this.generateLlmResponse({
      message: payload.message,
      topic: payload.topic,
      subject: 'physics',
      grade: 11,
      intent: payload.intent,
      context: [],
      ragChunks: payload.ragChunks,
      selectedPattern: payload.selectedPattern,
      allowGeneralKnowledge: true,
    });

    if (!llmText) {
      return payload.answer;
    }

    return {
      short_answer: llmText,
      steps: [],
    };
  }

  private enhanceAnswerWithLocalPhysicsIfUseful(payload: {
    message: string;
    topic: string;
    answer: AiAnswer;
    selectedPattern?: ProblemPattern;
    ragChunks: RagContextChunk[];
  }) {
    if (!this.isGenericFallbackAnswer(payload.answer)) {
      return payload.answer;
    }

    const localAnswer = this.buildLocalPhysicsAnswer(
      payload.message,
      payload.topic,
    );

    if (localAnswer) {
      return localAnswer;
    }

    if (payload.ragChunks.length > 0) {
      const chunk = payload.ragChunks[0];

      return {
        short_answer: this.truncateForFallback(chunk.text),
        steps: [
          `Nguồn tham chiếu gần nhất: ${chunk.title ?? chunk.id}.`,
          payload.selectedPattern
            ? `Dạng bài gần nhất: ${payload.selectedPattern.name}.`
            : 'Câu trả lời được rút từ theory chunk liên quan nhất.',
        ],
      };
    }

    return payload.answer;
  }

  private isGenericFallbackAnswer(answer: AiAnswer) {
    return (
      answer.steps.length === 0 ||
      answer.short_answer.includes('LLM/RAG') ||
      answer.short_answer.includes('Chưa tìm thấy')
    );
  }

  private buildLocalPhysicsAnswer(message: string, topic: string): AiAnswer | undefined {
    const normalized = this.normalize(message);

    if (
      topic === 'mechanical_oscillation' ||
      this.hasAll(normalized, ['dao dong co', 'vi tri can bang'])
    ) {
      return {
        short_answer:
          'Dao động cơ là chuyển động qua lại quanh vị trí cân bằng và lặp đi lặp lại theo thời gian.',
        steps: [
          'Vị trí cân bằng là vị trí mà vật thường xuyên đi qua trong quá trình dao động.',
          'Đặc trưng quan trọng là chuyển động có tính lặp lại quanh vị trí cân bằng.',
        ],
      };
    }

    if (
      this.hasAny(normalized, ['bien do']) &&
      this.hasAny(normalized, ['dinh nghia', 'la gi', 'nhu the nao'])
    ) {
      return {
        short_answer:
          'Biên độ A là li độ cực đại của vật dao động điều hòa, tức độ lệch lớn nhất của vật so với vị trí cân bằng.',
        steps: [
          'Biên độ cho biết vật đi xa vị trí cân bằng nhiều nhất bao nhiêu.',
          'Trong dao động điều hòa, biên độ là một giá trị không âm và không đổi nếu bỏ qua hao phí.',
        ],
      };
    }

    if (this.hasAny(normalized, ['pha ban dau'])) {
      return {
        short_answer:
          'Pha ban đầu φ cho biết trạng thái ban đầu của dao động tại thời điểm t = 0.',
        steps: [
          'Trạng thái ban đầu bao gồm vị trí hoặc chiều chuyển động ban đầu của vật.',
          'Trong pha dao động ωt + φ, φ là phần pha đã có ngay khi bắt đầu xét chuyển động.',
        ],
      };
    }

    if (this.hasAny(normalized, ['do lech pha', 'lech pha'])) {
      return {
        short_answer:
          'Độ lệch pha là hiệu pha giữa hai dao động cùng chu kì, cho biết hai dao động sớm pha hoặc trễ pha so với nhau.',
        steps: [
          'Nếu hiệu pha dương hoặc âm, một dao động đạt cùng trạng thái trước hoặc sau dao động còn lại.',
          'Khi độ lệch pha không đổi, quan hệ sớm pha hoặc trễ pha giữa hai dao động cũng không đổi.',
        ],
      };
    }

    if (
      this.hasAny(normalized, ['tan so goc', 'omega']) &&
      this.hasAny(normalized, ['chu ki', 'chu ky']) &&
      this.hasAny(normalized, ['tan so f', 'tan so'])
    ) {
      return {
        short_answer:
          'Omega hay ω là tần số góc của dao động, liên hệ với chu kì T và tần số f bởi ω = 2π/T và ω = 2πf, đơn vị là rad/s.',
        steps: [
          'Vì f = 1/T nên ω = 2πf.',
          'Thay f = 1/T vào công thức trên thu được ω = 2π/T.',
        ],
      };
    }

    if (
      this.hasAny(normalized, ['tan so dao dong', 'tan so']) &&
      this.hasAny(normalized, ['chu ki', 'chu ky']) &&
      this.hasAny(normalized, ['f =', 'cong thuc', 'lien he'])
    ) {
      return {
        short_answer:
          'Tần số f là số dao động trong một giây; tần số liên hệ với chu kì theo công thức f = 1/T và có đơn vị Hz.',
        steps: [
          'Chu kì T là thời gian để thực hiện một dao động toàn phần.',
          'Do đó trong 1 giây, số dao động bằng nghịch đảo của chu kì: f = 1/T.',
        ],
      };
    }

    if (
      this.hasAny(normalized, ['chu ki', 'chu ky']) &&
      this.hasAny(normalized, ['don vi', 'la gi'])
    ) {
      return {
        short_answer:
          'Chu kì T là thời gian thực hiện một dao động toàn phần; đơn vị giây là đơn vị của chu kì.',
        steps: [
          'Kí hiệu T dùng để biểu diễn chu kì dao động.',
          'Nếu vật lặp lại trạng thái sau khoảng thời gian T thì khoảng thời gian đó là một chu kì.',
        ],
      };
    }

    if (
      this.hasAny(normalized, ['phuong trinh van toc', 'van toc']) &&
      this.hasAny(normalized, ['x = a cos', 'omega t', 'phi'])
    ) {
      return {
        short_answer:
          "Từ x = A cos(ωt + φ), vận tốc là đạo hàm của li độ theo thời gian: v = x' và v = -ωA sin(ωt + φ).",
        steps: [
          'Lấy đạo hàm x theo thời gian.',
          "Vì đạo hàm của cos(ωt + φ) là -ω sin(ωt + φ), nên v = x' = -ωA sin(ωt + φ).",
        ],
      };
    }

    if (
      this.hasAny(normalized, ['a, omega', 'a omega', 'omega va phi']) ||
      (this.hasAny(normalized, ['cac dai luong']) &&
        this.hasAll(normalized, ['a', 'omega', 'phi']))
    ) {
      return {
        short_answer:
          'Trong phương trình x = A cos(ωt + φ), A là biên độ, omega là tần số góc, phi là pha ban đầu.',
        steps: [
          'A cho biết li độ cực đại của vật.',
          'Omega quyết định tốc độ biến thiên pha theo thời gian.',
          'Phi xác định pha của dao động tại thời điểm ban đầu.',
        ],
      };
    }

    if (
      this.hasAny(normalized, ['phuong trinh dao dong', 'x = a cos']) &&
      this.hasAny(normalized, ['y nghia', 'nhu the nao'])
    ) {
      return {
        short_answer:
          'Phương trình x = A cos(ωt + φ) mô tả li độ x của vật theo thời gian; x là li độ, A là biên độ, omega là tần số góc, phi là pha ban đầu và omega t + phi là pha dao động.',
        steps: [
          'Li độ x cho biết vị trí của vật so với vị trí cân bằng tại thời điểm t.',
          'Pha dao động ωt + φ xác định trạng thái dao động của vật ở thời điểm đó.',
        ],
      };
    }

    return undefined;
  }

  private async generateLlmResponse(payload: {
    message: string;
    topic: string;
    subject: string;
    grade: number;
    intent: AiIntent;
    sessionId?: string;
    simulationId?: string;
    simulationTitle?: string;
    context: { role: 'user' | 'assistant'; content: string }[];
    ragChunks: RagContextChunk[];
    selectedPattern?: ProblemPattern;
    allowGeneralKnowledge: boolean;
  }) {
    if (!this.llmService.isConfigured()) {
      return undefined;
    }

    try {
      const references = payload.ragChunks
        .slice(0, 5)
        .map(
          (chunk, index) =>
            `[${index + 1}]\ntitle: ${chunk.title ?? chunk.id}\ntext: ${chunk.text}`,
        )
        .join('\n');
      const generalKnowledgeRule = payload.allowGeneralKnowledge
        ? 'Nếu tài liệu nội bộ không đủ, được dùng kiến thức Vật lí 11 phổ thông, nhưng hãy nói rõ là đang suy luận ngoài dữ liệu nội bộ.'
        : 'Không suy đoán hoặc bịa thêm khi tài liệu không đủ; hãy nói rõ: "Mình chưa có đủ dữ liệu trong tài liệu hiện tại."';
      const context = payload.context
        .slice(-6)
        .map((item) => `${item.role}: ${item.content}`)
        .join('\n');
      const userPrompt = [
        `SUBJECT: ${payload.subject}`,
        `GRADE: ${payload.grade}`,
        `TOPIC: ${payload.topic}`,
        `SIMULATION_ID: ${payload.simulationId ?? 'none'}`,
        payload.simulationTitle
          ? `SIMULATION_TITLE: ${payload.simulationTitle}`
          : '',
        `INTENT: ${payload.intent}`,
        'REFERENCES:',
        references || '(Không có theory chunk phù hợp.)',
        'CONTEXT:',
        context || '(Không có ngữ cảnh trước đó.)',
        'QUESTION:',
        payload.message,
      ]
        .filter(Boolean)
        .join('\n\n');

      const response = await this.llmService.complete([
        {
          role: 'system',
          content: [
            'Bạn là trợ lý AI trong phòng thí nghiệm mô phỏng khoa học THPT.',
            'Trả lời bằng tiếng Việt tự nhiên, ngắn gọn, dễ hiểu; câu trả lời phù hợp một sidebar, khoảng 4–6 câu.',
            'Ưu tiên nội dung trong REFERENCES/theory chunks được cung cấp.',
            generalKnowledgeRule,
            'Không bịa nguồn hoặc chi tiết không có căn cứ. Có thể nhắc [1], [2] khi phù hợp, nhưng không cần trích dẫn hình thức.',
            'Không dùng LaTeX dưới bất kỳ dạng nào, gồm $$...$$, \\[...\\], \\(...\\). Dùng công thức plain text/Unicode, ví dụ T = 2*pi/ω, x = A*cos(ωt + φ), T = 2*pi*sqrt(l/g), A².',
            'Nếu có SIMULATION_ID, liên hệ với mô phỏng và gợi ý một thao tác cụ thể khi phù hợp.',
          ].join('\n'),
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ]);

      return this.cleanMathText(response);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  private buildLocalChatFallback(
    message: string,
    topic: string,
    ragChunks: RagContextChunk[],
    selectedPattern?: ProblemPattern,
  ) {
    if (ragChunks.length > 0) {
      const chunk = ragChunks[0];

      return [
        `Dựa trên tài liệu hiện có, ${chunk.title ?? chunk.id} cho biết:`,
        this.truncateForFallback(chunk.text),
        selectedPattern
          ? `Dạng gần nhất là: ${selectedPattern.name}.`
          : 'Bạn có thể hỏi cụ thể hơn để mình chọn đúng dạng bài.',
      ].join('\n\n');
    }

    return [
      'Mình chưa tìm thấy đủ dữ liệu trong tài liệu hiện tại để trả lời chắc chắn.',
      'Bạn có thể hỏi lại với chủ đề cụ thể hơn hoặc cung cấp thêm dữ kiện.',
    ].join('\n\n');
  }

  private toReferences(chunks: RagContextChunk[]) {
    return chunks.map((chunk) => {
      const source = this.referenceSourceName(chunk);

      return {
        id: chunk.id,
        title: chunk.title ?? chunk.id,
        text: chunk.text,
        topic: chunk.topic,
        ...(source ? { source } : {}),
        ...(chunk.metadata ? { metadata: chunk.metadata } : {}),
      };
    });
  }

  private toRagReference(chunk: TheoryChunk): RagReference {
    const source = chunk.source?.sourceName ?? chunk.source?.fileName;

    return {
      id: chunk.id,
      title: chunk.title ?? chunk.id,
      text: chunk.text,
      topic: chunk.topic,
      ...(source ? { source } : {}),
      ...(chunk.metadata ? { metadata: chunk.metadata } : {}),
      retrievalType: 'keyword',
    };
  }

  private referenceSourceName(chunk: RagContextChunk) {
    const source = (chunk as RagContextChunk & { source?: unknown }).source;

    if (typeof source === 'string') {
      return source;
    }

    if (source && typeof source === 'object') {
      const value = source as { sourceName?: unknown; fileName?: unknown };
      if (typeof value.sourceName === 'string') {
        return value.sourceName;
      }
      if (typeof value.fileName === 'string') {
        return value.fileName;
      }
    }

    return undefined;
  }

  private findPatternByIds(patterns: ProblemPattern[], ids: string[]) {
    return ids
      .map((id) => patterns.find((pattern) => pattern.patternId === id))
      .find(Boolean);
  }

  private defaultConcepts(topic: string) {
    const topicConcepts: Record<string, string[]> = {
      mechanical_oscillation: ['dao động cơ', 'vị trí cân bằng'],
      simple_harmonic_motion: ['dao động điều hòa', 'biên độ', 'pha'],
      shm_kinematics: ['li độ', 'vận tốc', 'gia tốc'],
      shm_energy: ['cơ năng', 'động năng', 'thế năng'],
      spring_oscillator: ['con lắc lò xo', 'chu kì'],
      simple_pendulum: ['con lắc đơn', 'dao động nhỏ'],
      damped_oscillation: ['dao động tắt dần'],
      forced_oscillation: ['dao động cưỡng bức'],
      resonance: ['cộng hưởng'],
    };

    return topicConcepts[topic] ?? [];
  }

  private defaultSkills(target: string[]) {
    if (target.includes('T')) {
      return ['xác định chu kì từ phương trình dao động'];
    }

    if (target.includes('energy')) {
      return ['phân tích năng lượng trong dao động điều hòa'];
    }

    return [];
  }

  private normalize(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/đ/g, 'd')
      .replace(/ð/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/Ä‘/g, 'd');
  }

  private hasAny(value: string, keywords: string[]) {
    return keywords.some((keyword) => value.includes(this.normalize(keyword)));
  }

  private hasAll(value: string, keywords: string[]) {
    return keywords.every((keyword) => value.includes(this.normalize(keyword)));
  }

  private toNumber(value: string) {
    return Number(value.replace(',', '.'));
  }

  private piTextToNumber(value: string) {
    const compact = value
      .replace(/\s/g, '')
      .replace(',', '.')
      .replace(/pi|Ï€/gi, 'π');
    const sign = compact.startsWith('-') ? -1 : 1;
    const unsigned = compact.replace(/^[+-]/, '');

    if (!unsigned.includes('π')) {
      return Number(compact);
    }

    const [coefficientText, denominatorText] = unsigned.split('π/');
    const coefficient =
      coefficientText === '' ? 1 : Number(coefficientText.replace('π', ''));
    const denominator = denominatorText ? Number(denominatorText) : 1;

    return sign * ((coefficient * Math.PI) / denominator);
  }

  private dedupeByKey(values: AiGivenValue[]) {
    const map = new Map<string, AiGivenValue>();

    for (const value of values) {
      map.set(value.key, value);
    }

    return [...map.values()];
  }

  private formatNumber(value: number) {
    return Number(value.toFixed(3)).toString().replace('.', ',');
  }

  private shouldIncludeChatDebug() {
    return process.env.NODE_ENV !== 'production' || process.env.AI_DEBUG === 'true';
  }

  private truncateForFallback(value: string, maxLength = 600) {
    const normalized = value.trim();
    return normalized.length <= maxLength
      ? normalized
      : `${normalized.slice(0, maxLength).trimEnd()}…`;
  }

  private cleanMathText(value?: string) {
    return String(value ?? '')
      .replace(
        /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g,
        (_match, blockFormula, squareFormula, inlineFormula, dollarFormula) =>
          this.simplifyLatexFormula(
            blockFormula || squareFormula || inlineFormula || dollarFormula,
          ),
      )
      .trim();
  }

  private simplifyLatexFormula(value: string) {
    return value
      .replace(/\\pm/g, '±')
      .replace(/\\omega/g, 'ω')
      .replace(/\\alpha/g, 'α')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\pi/g, 'π')
      .replace(/\\varphi|\\phi/g, 'φ')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
      .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
      .replace(/\^\{2\}|\^2/g, '²')
      .replace(/\^\{3\}|\^3/g, '³')
      .replace(/\{|\}/g, '')
      .replace(/\\/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
