import { Injectable } from '@nestjs/common';
import { ProblemPatternService } from '../learning/problem-pattern/problem-pattern.service';
import { SimulationTemplateService } from '../learning/simulation-template/simulation-template.service';
import { TheoryChunkService } from '../learning/theory-chunk/theory-chunk.service';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';
import { ChatRequestDto } from './dto/chat-request.dto';
import { GenerateQuizRequestDto } from './dto/generate-quiz.dto';
import { LlmAnswerDetected, LlmAnswerService } from './llm-answer.service';
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

    if (!selectedPattern) {
      return this.runSearchAssistant(message, subject, request.context);
    }

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
    const simulationId = request.simulationId;
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

  async generateQuiz(request: GenerateQuizRequestDto) {
    const simulationId = normalizeSimulationId(request.simulationId);
    const subject = request.subject;
    const count = request.count;

    const simMeta = getSimulationMetadata(simulationId, subject);
    const simTitle = simMeta ? simMeta.title : 'Chủ đề khoa học';
    const simSubject = simMeta
      ? simMeta.subject === 'chem'
        ? 'Hóa học'
        : simMeta.subject === 'math'
          ? 'Toán học'
          : 'Vật lý'
      : 'Khoa học';

    const systemPrompt = [
      `Bạn là chuyên gia thiết kế câu hỏi trắc nghiệm kiểm tra kiến thức khoa học tự nhiên THPT Việt Nam.`,
      `Nhiệm vụ của bạn là tạo chính xác đúng ${count} câu hỏi trắc nghiệm khách quan (MCQ) có độ khó tăng dần liên quan đến chủ đề mô phỏng: "${simTitle}" (Môn học: ${simSubject}).`,
      `Yêu cầu về câu hỏi:`,
      `- Câu hỏi phải được viết bằng tiếng Việt tự nhiên, chính xác về mặt học thuật và sư phạm.`,
      `- Mỗi câu hỏi gồm 4 phương án lựa chọn: a, b, c, d. Chỉ có duy nhất một phương án đúng.`,
      `- Cung cấp lời giải thích (explanation) ngắn gọn (1-2 câu) cho đáp án đúng.`,
      `- Viết công thức bằng plain text/Unicode (ví dụ: H2SO4, y = ax^2 + bx + c), không dùng khối LaTeX.`,
      ``,
      `Bạn PHẢI trả về kết quả dưới dạng một block JSON duy nhất có cấu trúc chính xác như sau:`,
      `{`,
      `  "questions": [`,
      `    {`,
      `      "q": "Nội dung câu hỏi?",`,
      `      "opts": [`,
      `        { "k": "a", "t": "Nội dung phương án A" },`,
      `        { "k": "b", "t": "Nội dung phương án B" },`,
      `        { "k": "c", "t": "Nội dung phương án C" },`,
      `        { "k": "d", "t": "Nội dung phương án D" }`,
      `      ],`,
      `      "correct": "a",`,
      `      "explanation": "Giải thích vì sao đáp án đó đúng."`,
      `    }`,
      `  ]`,
      `}`,
      `KHÔNG viết thêm bất kỳ giải thích, chào hỏi hay ký tự nào ngoài block JSON. Hãy chắc chắn JSON hợp lệ.`,
    ].join('\n');

    let questions: any[] = [];
    let usedLlm = false;

    if (this.llmService.isConfigured()) {
      try {
        const responseText = await this.llmService.complete([
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Hãy sinh đúng ${count} câu hỏi trắc nghiệm cho mô phỏng ${simulationId}.`,
          },
        ]);

        if (responseText) {
          const cleanText = responseText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          const parsed = JSON.parse(cleanText);
          if (parsed && Array.isArray(parsed.questions)) {
            questions = parsed.questions;
            usedLlm = true;
          }
        }
      } catch (err) {
        console.error('LLM generate quiz failed, using local fallback:', err);
      }
    }

    if (!usedLlm) {
      questions = this.buildLocalQuizFallback(simulationId, subject, count);
    }

    return {
      simulationId,
      count: questions.length,
      questions,
      used_llm: usedLlm,
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

    if (
      input.hasContext &&
      this.hasAny(normalized, ['vay', 'no', 'cai do', 'lien he'])
    ) {
      answerIntent = 'follow_up';
    } else if (
      input.hasSimulation ||
      this.hasAny(normalized, ['mo phong', 'keo', 'tham so'])
    ) {
      answerIntent = 'simulation_guidance';
    } else if (
      input.intent === 'solve_and_simulate' ||
      this.hasAny(normalized, ['tinh', 'tim', 'thay so'])
    ) {
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
    } else if (
      input.intent === 'explain' ||
      this.hasAny(normalized, ['la gi', 'the nao', 'dinh nghia'])
    ) {
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

  private detectDifficulty(
    normalizedMessage: string,
  ): 'basic' | 'medium' | 'advanced' {
    if (this.hasAny(normalizedMessage, ['chung minh', 'suy ra', 'nang cao'])) {
      return 'advanced';
    }

    if (
      this.hasAny(normalizedMessage, [
        'tinh',
        'tim',
        'phuong trinh',
        'cong thuc',
      ])
    ) {
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
        'thang deu',
        'bien doi deu',
        'kinematics',
        'chuyen dong thang',
      ])
    ) {
      return 'kinematics';
    }

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

  private buildLocalPhysicsAnswer(
    message: string,
    topic: string,
  ): AiAnswer | undefined {
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
      const patternText = payload.selectedPattern
        ? `Dạng bài: ${payload.selectedPattern.name}; công thức/hướng xử lí: ${
            payload.selectedPattern.mainFormula ?? 'khái niệm'
          }; mục tiêu: ${payload.selectedPattern.target?.join(', ')}`
        : 'Chưa nhận diện chắc dạng bài từ dataset.';
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

      let systemPromptContent = '';
      if (payload.simulationId) {
        const simMeta = getSimulationMetadata(
          payload.simulationId,
          payload.subject,
        );
        const simInfo = simMeta
          ? `Học sinh đang thực hành trong phòng mô phỏng: "${simMeta.title}" (Môn: ${
              simMeta.subject === 'chem'
                ? 'Hóa học'
                : simMeta.subject === 'math'
                  ? 'Toán học'
                  : 'Vật lý'
            }).`
          : '';
        systemPromptContent = [
          `Bạn là trợ lý học tập AI chuyên giải đáp các câu hỏi, thắc mắc cho học sinh trong phòng thí nghiệm và mô phỏng tương tác.`,
          simInfo,
          `Hãy trả lời câu hỏi của học sinh bằng tiếng Việt một cách khoa học, ngắn gọn, súc tích, dễ hiểu và sinh động.`,
          `Nếu câu hỏi liên quan đến các bước thực hiện thí nghiệm hiện tại hoặc nguyên lý hoạt động của mô phỏng này, hãy hướng dẫn tận tình.`,
          `Không dùng block LaTeX kiểu \\[...\\] hoặc \\(...\\); hãy viết công thức bằng plain text/Unicode, ví dụ x = A*cos(omega*t + phi).`,
          `Giữ câu trả lời súc tích dưới 4-5 câu để hiển thị vừa vặn trong khung chat nhỏ ở thanh sidebar bên phải.`,
        ].join('\n');
      } else {
        const subjectLabel =
          payload.subject === 'chem'
            ? 'Hóa học'
            : payload.subject === 'math'
              ? 'Toán học'
              : 'Vật lý';
        systemPromptContent = [
          `Bạn là trợ lý học tập AI cho học sinh THPT, hỗ trợ môn ${subjectLabel} lớp ${payload.grade}.`,
          'Ưu tiên trả lời theo dữ liệu nội bộ và dạng bài đã nhận diện.',
          generalKnowledgeRule,
          'Không bịa nguồn hoặc suy đoán ngoài phạm vi kiến thức phổ thông.',
          'Giọng giải thích ngắn gọn, dễ hiểu, có ví dụ trực quan; giữ công thức chính xác.',
          'Không dùng block LaTeX kiểu \\[...\\] hoặc \\(...\\); viết công thức bằng plain text/Unicode.',
          'Nếu là bài tính, trình bày ngắn: nhận dạng dữ kiện → công thức → thay số → kết luận.',
        ].join('\n');
      }

      console.log('DEBUG generateLlmResponse:', {
        simulationId: payload.simulationId,
        subject: payload.subject,
        systemPromptContent,
        userMsg: [
          `Môn: ${payload.subject}, lớp: ${payload.grade}`,
          `Intent: ${payload.intent}`,
          `Topic: ${payload.topic}`,
          patternText,
          references
            ? `Tài liệu nội bộ:\n${references}`
            : 'Tài liệu nội bộ: chưa tìm thấy chunk phù hợp.',
          `Câu hỏi của học sinh: ${payload.message}`,
        ].join('\n\n'),
      });

      const response = await this.llmService.complete([
        {
          role: 'system',
          content: systemPromptContent,
        },
        ...payload.context.slice(-6),
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
    return (
      process.env.NODE_ENV !== 'production' || process.env.AI_DEBUG === 'true'
    );
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

  private async runSearchAssistant(
    message: string,
    initialSubject?: string,
    context?: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<AiAnalysisOutput> {
    let isLlm = this.llmService.isConfigured();

    let isRelated = true;
    let hasSimulation = false;
    let simulationId: string | null = null;
    let subject = initialSubject ?? 'physics';
    let topic = 'unknown';
    let shortAnswer = '';
    let confidence = 0.5;

    if (isLlm) {
      const systemPrompt = [
        'Bạn là trợ lý học tập AI chuyên phân tích yêu cầu học sinh và tìm kiếm mô phỏng tương thích trong kho 63 mô phỏng ảo:',
        '--- Hóa học 10 ---',
        '- CHEM10-01: Thí nghiệm bắn phá lá vàng – Rutherford (Môn: chem, topic: rutherford_experiment)',
        '- CHEM10-02: Thử màu ngọn lửa của các kim loại (Na, K, Cu, Ca) (Môn: chem, topic: flame_test)',
        '- CHEM10-03: Kẽm tác dụng với dung dịch HCl (Môn: chem, topic: zn_hcl)',
        '- CHEM10-04: Đốt cháy dây magnesium trong không khí (Môn: chem, topic: mg_combustion)',
        '- CHEM10-05: Phản ứng tỏa nhiệt – tôi vôi (CaO + H₂O) (Môn: chem, topic: quicklime)',
        '- CHEM10-06: Phản ứng thu nhiệt (NH₄Cl + Ba(OH)₂) (Môn: chem, topic: endothermic)',
        '- CHEM10-07: Ảnh hưởng của nồng độ đến tốc độ phản ứng (Môn: chem, topic: rate_concentration)',
        '- CHEM10-08: Ảnh hưởng của chất xúc tác – phân hủy H₂O₂ (Môn: chem, topic: rate_catalyst)',
        '- CHEM10-09: Ảnh hưởng của diện tích bề mặt tiếp xúc (Môn: chem, topic: rate_surface_area)',
        '- CHEM10-10: Nhận biết ion halide bằng dung dịch AgNO₃ (Môn: chem, topic: halide_identification)',
        '- CHEM10-11: Tính tẩy màu của nước chlorine (Môn: chem, topic: chlorine_bleaching)',
        '- CHEM10-12: Chlorine đẩy bromine ra khỏi muối bromide (Môn: chem, topic: halogen_displacement)',
        '--- Hóa học 11 ---',
        '- CHEM11-01: Độ pH và chất chỉ thị (Môn: chem, topic: indicator_ph)',
        '- CHEM11-02: Chuẩn độ Acid - Base (Môn: chem, topic: acid_base_titration)',
        '- CHEM11-03: Đồng tác dụng với dung dịch HNO₃ đặc (Môn: chem, topic: copper_hno3)',
        '- CHEM11-04: Ammonia tác dụng với HCl đặc tạo khói trắng (Môn: chem, topic: ammonia_hcl)',
        '- CHEM11-05: H₂SO₄ đặc tác dụng với đường (Môn: chem, topic: h2so4_sucrose)',
        '- CHEM11-06: Ethylene tác dụng với nước bromine (Môn: chem, topic: ethylene_bromine)',
        '- CHEM11-07: Acetylene tác dụng với dung dịch AgNO₃/NH₃ (Môn: chem, topic: acetylene_agno3)',
        '- CHEM11-08: Ethanol tác dụng với kim loại sodium (Môn: chem, topic: ethanol_sodium)',
        '- CHEM11-09: Phenol tác dụng với nước bromine (Môn: chem, topic: phenol_bromine)',
        '- CHEM11-10: Glycerol tác dụng với Cu(OH)₂ (Môn: chem, topic: glycerol_cuoh2)',
        '- CHEM11-11: Tính chất hóa học của acetic acid (Môn: chem, topic: acetic_acid)',
        '--- Hóa học 12 ---',
        '- CHEM12-01: Điều chế ethyl acetate (phản ứng ester hóa) (Môn: chem, topic: esterification)',
        '- CHEM12-02: Phản ứng xà phòng hóa chất béo (Môn: chem, topic: saponification)',
        '- CHEM12-03: Glucose tác dụng với Cu(OH)₂ (Môn: chem, topic: glucose_cuoh2)',
        '- CHEM12-04: Phản ứng tráng bạc của glucose (Môn: chem, topic: silver_mirror)',
        '- CHEM12-05: Phản ứng màu của tinh bột với iodine (Môn: chem, topic: starch_iodine)',
        '- CHEM12-06: Phản ứng màu biuret của protein (Môn: chem, topic: biuret_protein)',
        '- CHEM12-07: Sodium tác dụng với nước (Môn: chem, topic: sodium_water)',
        '- CHEM12-08: Đinh sắt tác dụng với dung dịch CuSO₄ (Môn: chem, topic: iron_cuso4)',
        '- CHEM12-09: Nhôm tác dụng với dung dịch NaOH (Môn: chem, topic: aluminum_naoh)',
        '- CHEM12-10: Phản ứng nhiệt nhôm (Môn: chem, topic: thermite)',
        '- CHEM12-11: Điều chế Fe(OH)₂ và Fe(OH)₃ (Môn: chem, topic: iron_hydroxides)',
        '- CHEM12-12: Điện phân dung dịch CuSO₄ (Môn: chem, topic: cuso4_electrolysis)',
        '- CHEM12-13: Ăn mòn điện hóa học (pin Zn-Cu) (Môn: chem, topic: electrochemical_corrosion)',
        '--- Toán ---',
        '- SIM-08_math: Đồ thị hàm số bậc hai (Môn: math, topic: quadratic)',
        '- SIM-16: Ném xiên và vòm cổng parabol (Môn: math, topic: projectile-arch)',
        '- SIM-17: Miền nghiệm hệ bất phương trình (Môn: math, topic: inequality)',
        '- SIM-18: Hệ thức lượng tam giác cột cờ (Môn: math, topic: triangulation)',
        '- SIM-19: Định nghĩa Elip ghim đinh (Môn: math, topic: conic)',
        '- SIM-20: Thống kê số liệu mẫu và biểu đồ (Môn: math, topic: statistics)',
        '--- Vật lý ---',
        '- SIM-02: Chuyển động ném xiên (Môn: physics, topic: projectile)',
        '- SIM-22: Sự rơi tự do (Môn: physics, topic: free_fall)',
        '- SIM-21: Chuyển động thẳng đều & biến đổi đều (Môn: physics, topic: kinematics)',
        '- SIM-23: Chuyển động ném ngang (Môn: physics, topic: horizontal_projectile)',
        '- SIM-24: Định luật II Newton – xe lăn (Môn: physics, topic: newton2)',
        '- SIM-25: Vật trượt trên mặt phẳng nghiêng (Môn: physics, topic: inclined_plane)',
        '- SIM-26: Con lắc lò xo nằm ngang (Môn: physics, topic: spring_pendulum)',
        '- SIM-27: Con lắc đơn dao động (Môn: physics, topic: simple_pendulum)',
        '- SIM-28: Chuyển động tròn đều (Môn: physics, topic: circular_motion)',
        '- SIM-29: Va chạm 1D – bảo toàn động lượng (Môn: physics, topic: collision)',
        '- SIM-30: Bảo toàn cơ năng (Môn: physics, topic: mechanical_energy)',
        '- SIM-31: Định luật Boyle – đẳng nhiệt (Môn: physics, topic: boyle)',
        '- SIM-32: Định luật Charles – đẳng áp (Môn: physics, topic: charles)',
        '- SIM-33: Thuyết động học phân tử chất khí (Môn: physics, topic: kinetic_theory)',
        '- SIM-34: Sự chuyển thể của chất (Môn: physics, topic: phase_transition)',
        '- SIM-35: Lực từ tác dụng lên dây dẫn (Môn: physics, topic: magnetic_force)',
        '- SIM-36: Lực Lorentz (Môn: physics, topic: lorentz_force)',
        '- SIM-37: Hiện tượng cảm ứng điện từ (Môn: physics, topic: electromagnetic_induction)',
        '- SIM-38: Máy phát điện xoay chiều (Môn: physics, topic: ac_generator)',
        '- SIM-39: Phóng xạ & chu kỳ bán rã (Môn: physics, topic: radioactive_decay)',
        '- SIM-40: Phản ứng phân hạch & nhiệt hạch (Môn: physics, topic: nuclear_reaction)',
        '- SIM-41: Năng lượng liên kết riêng (Môn: physics, topic: binding_energy)',
        '- SIM-42: Dao động điều hòa (Môn: physics, topic: simple_harmonic_motion)',
        '- SIM-43: Dao động tắt dần (Môn: physics, topic: damped_oscillation)',
        '- SIM-44: Hiện tượng cộng hưởng (Môn: physics, topic: resonance)',
        '- SIM-45: Sóng ngang truyền trên dây (Môn: physics, topic: transverse_wave)',
        '- SIM-46: Sóng dừng (Môn: physics, topic: standing_wave)',
        '- SIM-47: Giao thoa sóng nước (Môn: physics, topic: wave_interference)',
        '- SIM-48: Định luật Coulomb & Lực tương tác (Môn: physics, topic: coulomb)',
        '- SIM-49: Điện trường & Đường sức điện (Môn: physics, topic: electric_field)',
        '- SIM-50: Định luật Ohm cho đoạn mạch (Môn: physics, topic: ohm_segment)',
        '- SIM-51: Mạch ghép điện trở nối tiếp/song song (Môn: physics, topic: resistor_circuit)',
        '- SIM-52: Định luật Ohm cho toàn mạch (Môn: physics, topic: ohm_full)',
        '',
        'Nhiệm vụ của bạn là:',
        '1. Đánh giá câu hỏi/yêu cầu của học sinh:',
        '- Nếu câu hỏi/yêu cầu hoàn toàn KHÔNG liên quan đến Toán, Lý, Hóa hay khoa học tự nhiên cấp THPT: Từ chối lịch sự và hướng dẫn học sinh quay lại chủ đề học tập. Set "is_related": false, "simulation_id": null.',
        '- Nếu liên quan đến khoa học nhưng KHÔNG có mô phỏng phù hợp trong danh sách trên: Giải thích ngắn gọn lý thuyết (2-4 câu) và thông báo chưa có mô phỏng cho chủ đề này. Set "is_related": true, "has_simulation": false, "simulation_id": null.',
        '- Nếu có thể liên kết với 1 mô phỏng trong danh sách: Giải thích kiến thức (2-4 câu) và giới thiệu mô phỏng. Set "is_related": true, "has_simulation": true, "simulation_id" tương ứng.',
        '',
        'QUY TẮC BẮT BUỘC: KHÔNG được viết mã "SIM-XX" trong trường short_answer. Chỉ dùng tên đầy đủ của mô phỏng.',
        '',
        '2. Trả về JSON duy nhất với cấu trúc sau:',
        '{',
        '  "is_related": boolean,',
        '  "has_simulation": boolean,',
        '  "simulation_id": "CHEM10-01" | ... | "CHEM10-12" | "CHEM11-01" | ... | "CHEM11-11" | "CHEM12-01" | ... | "CHEM12-13" | "SIM-02" | "SIM-08" | "SIM-16" | ... | "SIM-52" | null,',
        '  "subject": "physics" | "math" | "chem",',
        '  "topic": string,',
        '  "short_answer": "Lời giải thích tự nhiên bằng tiếng Việt. Unicode cho công thức. Không dùng LaTeX block. Không viết mã SIM-XX.",',
        '  "confidence": number',
        '}',
        '',
        'KHÔNG viết bất kỳ nội dung nào ngoài block JSON. Đảm bảo JSON hợp lệ.',
      ].join('\n');

      try {
        const contextMessages = (context ?? [])
          .slice(-4)
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));
        const responseText = await this.llmService.complete([
          { role: 'system', content: systemPrompt },
          ...contextMessages,
          { role: 'user', content: `Yêu cầu của học sinh: "${message}"` },
        ]);

        if (responseText) {
          const cleanText = responseText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          const parsed = JSON.parse(cleanText);
          isRelated = parsed.is_related ?? true;
          hasSimulation = parsed.has_simulation ?? false;
          simulationId = parsed.simulation_id ?? null;
          subject = parsed.subject ?? subject;
          topic = parsed.topic ?? topic;
          shortAnswer = parsed.short_answer ?? '';
          confidence = parsed.confidence ?? 0.85;
        }
      } catch (err) {
        console.error(
          'LLM parse error or complete failed, using regex fallback:',
          err,
        );
        isLlm = false;
      }
    }

    if (!isLlm) {
      const normalizedMsg = this.normalize(message);
      const isOutofScope = !this.hasAny(normalizedMsg, [
        'ly',
        'vat ly',
        'physics',
        'hoa',
        'chemistry',
        'chem',
        'toan',
        'math',
        'xap phong',
        'chat beo',
        'sapon',
        'fat',
        'ethyl',
        'ester',
        'axit axetic',
        'ethanol',
        'glucose',
        'cu(oh)2',
        'dong',
        'glucozo',
        'phuc',
        'trang bac',
        'trang guong',
        'agno3',
        'tollens',
        'bac nitrat',
        'tinh bot',
        'iodine',
        'i-ot',
        'iot',
        'biuret',
        'protein',
        'long trang trung',
        'peptit',
        'sodium',
        'natri',
        'nuoc',
        'kim loai kiem',
        'dinh sat',
        'cuso4',
        'nhom',
        'naoh',
        'nhiet nhom',
        'thermite',
        'fe(oh)2',
        'fe(oh)3',
        'dien phan',
        'an mon dien hoa',
        'pin zn',
        'pin cu',
        'bac hai',
        'parabol',
        'phuong trinh',
        'nghiem',
        'dinh',
        'nem xien',
        'vom',
        'vom cong',
        'cong parabol',
        'quy dao vom',
        'mien nghiem',
        'bat phuong trinh',
        'he bat phuong trinh',
        'he thuc luong',
        'cot co',
        'tam giac cot co',
        'do chieu cao',
        'elip',
        'ghim dinh',
        'duong conic',
        'tieu diem',
        'thong ke',
        'so lieu mau',
        'bieu do hop',
        'box plot',
        'quy dao',
        'van toc',
        'gia toc',
        'chu ky',
        'chu ki',
        'tan so',
        'bien do',
        'li do',
        'toa do',
        'vi tri',
        'cuc dai',
        'co nang',
        'dong nang',
        'the nang',
        'cong huong',
        'ph',
        'chi thi',
        'chat chi thi',
        'quy tim',
        'chuan do',
        'acid base',
        'axit bazo',
        'hno3',
        'dong tac dung',
        'ammonia',
        'nh3',
        'hcl',
        'khoi trang',
        'h2so4',
        'duong',
        'saccharose',
        'ethylene',
        'brom',
        'acetylene',
        'axetilen',
        'phenol',
        'glycerol',
        'glycerin',
        'acetic',
        'roi tu do',
        'free fall',
      ]);

      if (isOutofScope) {
        isRelated = false;
        hasSimulation = false;
        simulationId = null;
        shortAnswer =
          'Chào bạn! Mình là Trợ lý AI Phòng Thí Nghiệm. Mình chỉ có thể giải đáp các kiến thức Toán học, Vật lý và Hóa học THPT và hỗ trợ các mô phỏng tương tác. Bạn vui lòng đặt câu hỏi liên quan đến các môn học này nhé!';
        confidence = 0.95;
      } else {
        const match = this.localRegexMatch(normalizedMsg);
        if (match) {
          isRelated = true;
          hasSimulation = true;
          simulationId = match.simId;
          subject = match.subject;
          topic = match.topic;
          shortAnswer = `Chào bạn! Mình nhận diện được bạn đang tìm hiểu về "${match.title}". Thí nghiệm này có sẵn trong hệ thống phòng lap ảo. Bạn có thể nhấn nút bắt đầu ở thẻ bên dưới để trực tiếp trải nghiệm mô phỏng và tương tác nhé!`;
          confidence = 0.9;
        } else {
          isRelated = true;
          hasSimulation = false;
          simulationId = null;
          shortAnswer =
            'Chào bạn! Câu hỏi của bạn thuộc chủ đề khoa học tự nhiên rất thú vị. Tuy nhiên, hiện tại hệ thống chưa có mô phỏng tương tác 3D/ảo trực quan cho chủ đề cụ thể này. Bạn có muốn khám phá các mô phỏng có sẵn như Ném xiên (Vật lý), Parabol (Toán) hay Xà phòng hóa (Hóa học) không?';
          confidence = 0.7;
        }
      }
    }

    let simulationObj: AiSimulation | undefined = undefined;
    if (simulationId) {
      simulationId = normalizeSimulationId(simulationId);
      const meta = getSimulationMetadata(simulationId, subject);
      if (meta) {
        simulationObj = {
          simulation_id: simulationId,
          title: meta.title,
          parameters: [],
        };
        subject = meta.subject;
        topic = meta.topic;
      } else {
        const dbTemplate =
          await this.simulationTemplateService.findById(simulationId);
        if (dbTemplate) {
          simulationObj = {
            simulation_id: dbTemplate.simulationId,
            title: dbTemplate.title,
            parameters: [],
          };
          subject = dbTemplate.subject;
          topic = dbTemplate.topic;
        }
      }
    }

    return {
      intent: hasSimulation ? 'simulate' : isRelated ? 'explain' : 'chat',
      subject,
      topic,
      confidence,
      analysis: {
        concepts: [],
        skills: [],
        given: [],
        target: [],
      },
      answer: {
        short_answer: shortAnswer,
        steps: [],
      },
      simulation: simulationObj,
      render_blocks: [
        { type: 'answer_card' },
        ...(simulationObj ? [{ type: 'simulation_card' as const }] : []),
      ],
      references: [],
    };
  }

  private localRegexMatch(
    normalizedText: string,
  ): {
    simId: string;
    subject: 'math' | 'physics' | 'chem';
    topic: string;
    title: string;
  } | null {
    // Hóa học lớp 10
    if (
      /rutherford|la vang|gold foil|hat alpha|ban pha|nguyen tu|nuclear model/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM10-01',
        subject: 'chem',
        topic: 'rutherford_experiment',
        title: 'Thí nghiệm bắn phá lá vàng – Rutherford',
      };
    }
    if (
      /thu mau ngon lua|flame test|mau ngon lua|na.*k.*cu.*ca|kim loai.*lua|lua.*kim loai/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM10-02',
        subject: 'chem',
        topic: 'flame_test',
        title: 'Thử màu ngọn lửa của các kim loại',
      };
    }
    if (/\bken\b.*hcl|zn.*hcl|hcl.*ken|zinc.*acid/.test(normalizedText)) {
      return {
        simId: 'CHEM10-03',
        subject: 'chem',
        topic: 'zn_hcl',
        title: 'Kẽm tác dụng với dung dịch HCl',
      };
    }
    if (
      /dot chay.*magnesium|magnesium.*chay|mg.*chay|dot chay.*mage|mge.*chay/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM10-04',
        subject: 'chem',
        topic: 'mg_combustion',
        title: 'Đốt cháy dây magnesium trong không khí',
      };
    }
    if (
      /toi voi|cao.*h2o|voi song|quicklime|phan ung toa nhiet.*voi/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM10-05',
        subject: 'chem',
        topic: 'quicklime',
        title: 'Phản ứng tỏa nhiệt – tôi vôi (CaO + H₂O)',
      };
    }
    if (
      /nh4cl.*ba\(oh\)2|ba\(oh\)2.*nh4cl|phan ung thu nhiet|endothermic|hap thu nhiet/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM10-06',
        subject: 'chem',
        topic: 'endothermic',
        title: 'Phản ứng thu nhiệt (NH₄Cl + Ba(OH)₂)',
      };
    }
    if (
      /nong do.*toc do|toc do.*nong do|rate.*concentration|concentration.*rate/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM10-07',
        subject: 'chem',
        topic: 'rate_concentration',
        title: 'Ảnh hưởng của nồng độ đến tốc độ phản ứng',
      };
    }
    if (
      /xuc tac.*toc do|mno2.*h2o2|h2o2.*mno2|catalyst|chat xuc tac/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM10-08',
        subject: 'chem',
        topic: 'rate_catalyst',
        title: 'Ảnh hưởng của chất xúc tác – phân hủy H₂O₂',
      };
    }
    if (
      /dien tich be mat|surface area|bot.*da voi|da voi.*bot/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM10-09',
        subject: 'chem',
        topic: 'rate_surface_area',
        title: 'Ảnh hưởng của diện tích bề mặt tiếp xúc',
      };
    }
    if (
      /nhan biet.*halide|agno3.*halide|agcl|agbr|agi|ion halide/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM10-10',
        subject: 'chem',
        topic: 'halide_identification',
        title: 'Nhận biết ion halide bằng dung dịch AgNO₃',
      };
    }
    if (
      /tay mau.*chlorine|chlorine.*tay mau|hclo.*tay|bleach.*chlor/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM10-11',
        subject: 'chem',
        topic: 'chlorine_bleaching',
        title: 'Tính tẩy màu của nước chlorine',
      };
    }
    if (
      /chlorine.*bromine|cl2.*br2|halogen displacement|day bromine|day brom/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM10-12',
        subject: 'chem',
        topic: 'halogen_displacement',
        title: 'Chlorine đẩy bromine ra khỏi muối bromide',
      };
    }
    if (
      /ethanol.*sodium|ruou.*natri|c2h5oh.*na|sodium.*ethanol/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM11-08',
        subject: 'chem',
        topic: 'ethanol_sodium',
        title: 'Ethanol tác dụng với kim loại Sodium',
      };
    }
    if (/\bph\b|chi thi|chat chi thi|quy tim|indicator/.test(normalizedText)) {
      return {
        simId: 'CHEM11-01',
        subject: 'chem',
        topic: 'indicator_ph',
        title: 'Độ pH và chất chỉ thị',
      };
    }
    if (/xa phong|chat beo|sapon|fat/.test(normalizedText)) {
      return {
        simId: 'CHEM12-02',
        subject: 'chem',
        topic: 'saponification',
        title: 'Phản ứng xà phòng hóa chất béo',
      };
    }
    if (/ethyl|ester|axit axetic|ethanol/.test(normalizedText)) {
      return {
        simId: 'CHEM12-01',
        subject: 'chem',
        topic: 'esterification',
        title: 'Điều chế ethyl acetate (phản ứng ester hóa)',
      };
    }
    if (
      /glucose.*cu\(oh\)2|dong.*glucozo|phuc.*dong|cu\(oh\)2/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM12-03',
        subject: 'chem',
        topic: 'glucose_cuoh2',
        title: 'Glucose tác dụng với Cu(OH)₂',
      };
    }
    if (/sodium.*nuoc|natri.*nuoc|na \+ h2o/.test(normalizedText)) {
      return {
        simId: 'CHEM12-07',
        subject: 'chem',
        topic: 'sodium_water',
        title: 'Sodium tác dụng với nước',
      };
    }
    if (/chuan do|titer|chuan do axit|chuan do bazo/.test(normalizedText)) {
      return {
        simId: 'CHEM11-02',
        subject: 'chem',
        topic: 'acid_base_titration',
        title: 'Chuẩn độ Acid - Base',
      };
    }
    if (
      /dong.*hno3|hno3.*dong|khi mau nau|no2.*dong|cu.*hno3/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM11-03',
        subject: 'chem',
        topic: 'copper_hno3',
        title: 'Đồng tác dụng với dung dịch HNO₃ đặc',
      };
    }
    if (/ammonia.*hcl|nho3.*hcl|khoi trang|nh3.*hcl/.test(normalizedText)) {
      return {
        simId: 'CHEM11-04',
        subject: 'chem',
        topic: 'ammonia_hcl',
        title: 'Ammonia tác dụng với HCl đặc (Khói trắng)',
      };
    }
    if (
      /h2so4.*duong|duong.*h2so4|saccharose.*h2so4|than hoa duong/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM11-05',
        subject: 'chem',
        topic: 'h2so4_sucrose',
        title: 'H₂SO₄ đặc tác dụng với đường (Saccharose)',
      };
    }
    if (
      /ethylene.*brom|brom.*ethylene|nuoc brom.*c2h4|mat mau brom/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM11-06',
        subject: 'chem',
        topic: 'ethylene_bromine',
        title: 'Ethylene tác dụng với nước Bromine',
      };
    }
    if (
      /acetylene.*agno3|c2h2.*agno3|ket tua vang|agno3.*nh3/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM11-07',
        subject: 'chem',
        topic: 'acetylene_agno3',
        title: 'Acetylene tác dụng với dung dịch AgNO₃/NH₃',
      };
    }
    if (
      /trang bac|trang guong|tollens|agno3.*nh3|bac nitrat.*glucose/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM12-04',
        subject: 'chem',
        topic: 'silver_mirror',
        title: 'Phản ứng tráng bạc của glucose',
      };
    }
    if (
      /tinh bot.*iodine|iodine.*tinh bot|iot.*tinh bot|i-ot.*tinh bot/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM12-05',
        subject: 'chem',
        topic: 'starch_iodine',
        title: 'Phản ứng màu của tinh bột với iodine',
      };
    }
    if (/biuret|protein|long trang trung|peptit/.test(normalizedText)) {
      return {
        simId: 'CHEM12-06',
        subject: 'chem',
        topic: 'biuret_protein',
        title: 'Phản ứng màu biuret của protein',
      };
    }
    if (/dinh sat.*cuso4|sat.*cuso4|fe.*cuso4/.test(normalizedText)) {
      return {
        simId: 'CHEM12-08',
        subject: 'chem',
        topic: 'iron_cuso4',
        title: 'Đinh sắt tác dụng với dung dịch CuSO₄',
      };
    }
    if (
      /nhom.*naoh|al.*naoh|aluminium.*naoh|aluminum.*naoh/.test(normalizedText)
    ) {
      return {
        simId: 'CHEM12-09',
        subject: 'chem',
        topic: 'aluminum_naoh',
        title: 'Nhôm tác dụng với dung dịch NaOH',
      };
    }
    if (/nhiet nhom|thermite|al.*fe2o3|fe2o3.*al/.test(normalizedText)) {
      return {
        simId: 'CHEM12-10',
        subject: 'chem',
        topic: 'thermite',
        title: 'Phản ứng nhiệt nhôm',
      };
    }
    if (
      /fe\(oh\)2|fe\(oh\)3|sat.*hydroxide|hidroxit sat/.test(normalizedText)
    ) {
      return {
        simId: 'CHEM12-11',
        subject: 'chem',
        topic: 'iron_hydroxides',
        title: 'Điều chế Fe(OH)₂ và Fe(OH)₃',
      };
    }
    if (/dien phan.*cuso4|cuso4.*dien phan/.test(normalizedText)) {
      return {
        simId: 'CHEM12-12',
        subject: 'chem',
        topic: 'cuso4_electrolysis',
        title: 'Điện phân dung dịch CuSO₄',
      };
    }
    if (/an mon dien hoa|pin zn.*cu|zn.*cu|dien hoa hoc/.test(normalizedText)) {
      return {
        simId: 'CHEM12-13',
        subject: 'chem',
        topic: 'electrochemical_corrosion',
        title: 'Ăn mòn điện hóa học (pin Zn-Cu)',
      };
    }
    if (/\bphenol\b|c6h5oh/.test(normalizedText)) {
      return {
        simId: 'CHEM11-09',
        subject: 'chem',
        topic: 'phenol_bromine',
        title: 'Phenol tác dụng với nước Bromine',
      };
    }
    if (
      /glycerol.*cu\(oh\)2|glycerin.*dong|dung dich xanh lam.*glycerol/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM11-10',
        subject: 'chem',
        topic: 'glycerol_cuoh2',
        title: 'Glycerol tác dụng với Cu(OH)₂',
      };
    }
    if (
      /acetic acid|axit axetic|ch3cooh|giam an|tinh chat.*axit axetic/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'CHEM11-11',
        subject: 'chem',
        topic: 'acetic_acid',
        title: 'Tính chất hóa học của Acetic Acid',
      };
    }
    if (/roi tu do|free fall|gia toc roi|g = 9\.?8/.test(normalizedText)) {
      return {
        simId: 'SIM-22',
        subject: 'physics',
        topic: 'free_fall',
        title: 'Sự rơi tự do',
      };
    }
    if (/bac hai|parabol|phuong trinh|nghiem|dinh/.test(normalizedText)) {
      return {
        simId: 'SIM-08',
        subject: 'math',
        topic: 'quadratic',
        title: 'Đồ thị hàm số bậc hai',
      };
    }
    if (
      /nem xien.*vom|vom cong|cong parabol|quy dao vom/.test(normalizedText)
    ) {
      return {
        simId: 'SIM-16',
        subject: 'math',
        topic: 'projectile-arch',
        title: 'Ném xiên và vòm cổng parabol',
      };
    }
    if (
      /mien nghiem|bat phuong trinh|he bat phuong trinh/.test(normalizedText)
    ) {
      return {
        simId: 'SIM-17',
        subject: 'math',
        topic: 'inequality',
        title: 'Miền nghiệm hệ bất phương trình',
      };
    }
    if (
      /he thuc luong|cot co|tam giac cot co|do chieu cao/.test(normalizedText)
    ) {
      return {
        simId: 'SIM-18',
        subject: 'math',
        topic: 'triangulation',
        title: 'Hệ thức lượng tam giác cột cờ',
      };
    }
    if (/elip|ghim dinh|duong conic|tieu diem/.test(normalizedText)) {
      return {
        simId: 'SIM-19',
        subject: 'math',
        topic: 'conic',
        title: 'Định nghĩa Elip ghim đinh',
      };
    }
    if (/thong ke|so lieu mau|bieu do hop|box plot/.test(normalizedText)) {
      return {
        simId: 'SIM-20',
        subject: 'math',
        topic: 'statistics',
        title: 'Thống kê số liệu mẫu và biểu đồ',
      };
    }
    if (
      /thang deu|bien doi deu|kinematics|chuyen dong thang/.test(normalizedText)
    ) {
      return {
        simId: 'SIM-21',
        subject: 'physics',
        topic: 'kinematics',
        title: 'Chuyển động thẳng đều & biến đổi đều',
      };
    }
    if (/nem ngang|nem theo phuong ngang/.test(normalizedText)) {
      return {
        simId: 'SIM-23',
        subject: 'physics',
        topic: 'horizontal_projectile',
        title: 'Chuyển động ném ngang',
      };
    }
    if (/nem xien|quy dao|goc nem/.test(normalizedText)) {
      return {
        simId: 'SIM-02',
        subject: 'physics',
        topic: 'projectile',
        title: 'Chuyển động ném xiên',
      };
    }
    if (
      /dinh luat 2 newton|dinh luat ii newton|xe lan|f ?= ?ma/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'SIM-24',
        subject: 'physics',
        topic: 'newton2',
        title: 'Định luật II Newton (Xe lăn)',
      };
    }
    if (/mat phang nghieng|vat truot|truot nghieng/.test(normalizedText)) {
      return {
        simId: 'SIM-25',
        subject: 'physics',
        topic: 'inclined_plane',
        title: 'Vật trượt trên mặt phẳng nghiêng',
      };
    }
    if (/lo xo|con lac lo xo|spring/.test(normalizedText)) {
      return {
        simId: 'SIM-26',
        subject: 'physics',
        topic: 'spring_pendulum',
        title: 'Con lắc lò xo nằm ngang',
      };
    }
    if (
      /con lac don|pendulum|chu ki con lac|dao dong con lac/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'SIM-27',
        subject: 'physics',
        topic: 'simple_pendulum',
        title: 'Con lắc đơn dao động',
      };
    }
    if (/tron deu|chuyen dong tron|luc huong tam/.test(normalizedText)) {
      return {
        simId: 'SIM-28',
        subject: 'physics',
        topic: 'circular_motion',
        title: 'Chuyển động tròn đều',
      };
    }
    if (/va cham|dong luong|bao toan dong luong/.test(normalizedText)) {
      return {
        simId: 'SIM-29',
        subject: 'physics',
        topic: 'collision',
        title: 'Va chạm 1D — bảo toàn động lượng',
      };
    }
    if (/bao toan co nang|co nang|the nang|dong nang/.test(normalizedText)) {
      return {
        simId: 'SIM-30',
        subject: 'physics',
        topic: 'mechanical_energy',
        title: 'Bảo toàn cơ năng',
      };
    }
    if (
      /boyle|dang nhiet|p1v1|ap suat.*the tich|the tich.*ap suat/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'SIM-31',
        subject: 'physics',
        topic: 'boyle',
        title: 'Định luật Boyle (đẳng nhiệt)',
      };
    }
    if (
      /charles|dang ap|v1.*t1|v\/t.*hang so|the tich.*nhiet do/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'SIM-32',
        subject: 'physics',
        topic: 'charles',
        title: 'Định luật Charles (đẳng áp)',
      };
    }
    if (/dong hoc phan tu|khi li tuong|phan tu khi/.test(normalizedText)) {
      return {
        simId: 'SIM-33',
        subject: 'physics',
        topic: 'kinetic_theory',
        title: 'Thuyết động học phân tử chất khí',
      };
    }
    if (/chuyen the|nong chay|bay hoi|dong dac|ngung tu/.test(normalizedText)) {
      return {
        simId: 'SIM-34',
        subject: 'physics',
        topic: 'phase_transition',
        title: 'Sự chuyển thể của chất',
      };
    }
    if (/luc tu.*day dan|ampere.*luc|day dan.*tu truong/.test(normalizedText)) {
      return {
        simId: 'SIM-35',
        subject: 'physics',
        topic: 'magnetic_force',
        title: 'Lực từ tác dụng lên dây dẫn',
      };
    }
    if (/lorentz|hat mang dien.*tu truong/.test(normalizedText)) {
      return {
        simId: 'SIM-36',
        subject: 'physics',
        topic: 'lorentz_force',
        title: 'Lực Lorentz',
      };
    }
    if (/cam ung dien tu|tu thong|suat dien dong/.test(normalizedText)) {
      return {
        simId: 'SIM-37',
        subject: 'physics',
        topic: 'electromagnetic_induction',
        title: 'Hiện tượng cảm ứng điện từ',
      };
    }
    if (
      /may phat dien|dong dien xoay chieu|ac generator/.test(normalizedText)
    ) {
      return {
        simId: 'SIM-38',
        subject: 'physics',
        topic: 'ac_generator',
        title: 'Máy phát điện xoay chiều',
      };
    }
    if (/phong xa|ban ra|chu ky ban ra|phan ra/.test(normalizedText)) {
      return {
        simId: 'SIM-39',
        subject: 'physics',
        topic: 'radioactive_decay',
        title: 'Phóng xạ & chu kỳ bán rã',
      };
    }
    if (
      /phan hach|nhiet hach|han nhan|nang luong hat nhan/.test(normalizedText)
    ) {
      return {
        simId: 'SIM-40',
        subject: 'physics',
        topic: 'nuclear_reaction',
        title: 'Phản ứng phân hạch & nhiệt hạch',
      };
    }
    if (/nang luong lien ket|do hut khoi/.test(normalizedText)) {
      return {
        simId: 'SIM-41',
        subject: 'physics',
        topic: 'binding_energy',
        title: 'Năng lượng liên kết riêng',
      };
    }
    if (/dao dong dieu hoa|shm|x ?= ?a.*cos/.test(normalizedText)) {
      return {
        simId: 'SIM-42',
        subject: 'physics',
        topic: 'simple_harmonic_motion',
        title: 'Dao động điều hòa',
      };
    }
    if (/dao dong tat dan|tat dan/.test(normalizedText)) {
      return {
        simId: 'SIM-43',
        subject: 'physics',
        topic: 'damped_oscillation',
        title: 'Dao động tắt dần',
      };
    }
    if (/cong huong|resonance|dao dong cong huong/.test(normalizedText)) {
      return {
        simId: 'SIM-44',
        subject: 'physics',
        topic: 'resonance',
        title: 'Hiện tượng cộng hưởng',
      };
    }
    if (/song ngang|truyen tren day|song co hoc/.test(normalizedText)) {
      return {
        simId: 'SIM-45',
        subject: 'physics',
        topic: 'transverse_wave',
        title: 'Sóng ngang truyền trên dây',
      };
    }
    if (/song dung|nut song|bung song/.test(normalizedText)) {
      return {
        simId: 'SIM-46',
        subject: 'physics',
        topic: 'standing_wave',
        title: 'Sóng dừng',
      };
    }
    if (/giao thoa song|interference|van giao thoa/.test(normalizedText)) {
      return {
        simId: 'SIM-47',
        subject: 'physics',
        topic: 'wave_interference',
        title: 'Giao thoa sóng nước',
      };
    }
    if (/coulomb|luc dien|dien tich|f ?= ?k.*q/.test(normalizedText)) {
      return {
        simId: 'SIM-48',
        subject: 'physics',
        topic: 'coulomb',
        title: 'Định luật Coulomb & Lực tương tác',
      };
    }
    if (/dien truong|duong suc dien|e ?= ?f.*q/.test(normalizedText)) {
      return {
        simId: 'SIM-49',
        subject: 'physics',
        topic: 'electric_field',
        title: 'Điện trường & Đường sức điện',
      };
    }
    if (/ohm.*doan mach|u ?= ?i\*?r|dinh luat ohm/.test(normalizedText)) {
      return {
        simId: 'SIM-50',
        subject: 'physics',
        topic: 'ohm_segment',
        title: 'Định luật Ohm cho đoạn mạch',
      };
    }
    if (
      /mach ghep|noi tiep.*song song|song song.*noi tiep|dien tro ghep/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'SIM-51',
        subject: 'physics',
        topic: 'resistor_circuit',
        title: 'Mạch ghép điện trở (Nối tiếp / Song song)',
      };
    }
    if (
      /toan mach|suat dien dong.*dien tro trong|e ?= ?i.*r\+r/.test(
        normalizedText,
      )
    ) {
      return {
        simId: 'SIM-52',
        subject: 'physics',
        topic: 'ohm_full',
        title: 'Định luật Ohm cho toàn mạch',
      };
    }
    return null;
  }

  private buildLocalQuizFallback(
    simulationId: string,
    subject?: string,
    count: number = 3,
  ) {
    const key =
      simulationId === 'SIM-08' && subject === 'math'
        ? 'SIM-08_math'
        : simulationId;
    const list =
      LOCAL_FALLBACK_QUESTIONS[key] || LOCAL_FALLBACK_QUESTIONS['default'];
    const result: typeof list = [];
    for (let i = 0; i < count; i++) {
      result.push(list[i % list.length]);
    }
    return result;
  }
}

const SIMULATIONS_METADATA: Record<
  string,
  { title: string; subject: 'math' | 'physics' | 'chem'; topic: string }
> = {
  'CHEM10-01': {
    title: 'Thí nghiệm bắn phá lá vàng – Rutherford',
    subject: 'chem',
    topic: 'rutherford_experiment',
  },
  'CHEM10-02': {
    title: 'Thử màu ngọn lửa của các kim loại',
    subject: 'chem',
    topic: 'flame_test',
  },
  'CHEM10-03': {
    title: 'Kẽm tác dụng với dung dịch HCl',
    subject: 'chem',
    topic: 'zn_hcl',
  },
  'CHEM10-04': {
    title: 'Đốt cháy dây magnesium trong không khí',
    subject: 'chem',
    topic: 'mg_combustion',
  },
  'CHEM10-05': {
    title: 'Phản ứng tỏa nhiệt – tôi vôi (CaO + H₂O)',
    subject: 'chem',
    topic: 'quicklime',
  },
  'CHEM10-06': {
    title: 'Phản ứng thu nhiệt (NH₄Cl + Ba(OH)₂)',
    subject: 'chem',
    topic: 'endothermic',
  },
  'CHEM10-07': {
    title: 'Ảnh hưởng của nồng độ đến tốc độ phản ứng',
    subject: 'chem',
    topic: 'rate_concentration',
  },
  'CHEM10-08': {
    title: 'Ảnh hưởng của chất xúc tác – phân hủy H₂O₂',
    subject: 'chem',
    topic: 'rate_catalyst',
  },
  'CHEM10-09': {
    title: 'Ảnh hưởng của diện tích bề mặt tiếp xúc',
    subject: 'chem',
    topic: 'rate_surface_area',
  },
  'CHEM10-10': {
    title: 'Nhận biết ion halide bằng dung dịch AgNO₃',
    subject: 'chem',
    topic: 'halide_identification',
  },
  'CHEM10-11': {
    title: 'Tính tẩy màu của nước chlorine',
    subject: 'chem',
    topic: 'chlorine_bleaching',
  },
  'CHEM10-12': {
    title: 'Chlorine đẩy bromine ra khỏi muối bromide',
    subject: 'chem',
    topic: 'halogen_displacement',
  },
  'CHEM12-01': {
    title: 'Điều chế ethyl acetate (phản ứng ester hóa)',
    subject: 'chem',
    topic: 'esterification',
  },
  'CHEM12-02': {
    title: 'Phản ứng xà phòng hóa chất béo',
    subject: 'chem',
    topic: 'saponification',
  },
  'CHEM12-03': {
    title: 'Glucose tác dụng với Cu(OH)₂',
    subject: 'chem',
    topic: 'glucose_cuoh2',
  },
  'CHEM12-04': {
    title: 'Phản ứng tráng bạc của glucose',
    subject: 'chem',
    topic: 'silver_mirror',
  },
  'CHEM12-05': {
    title: 'Phản ứng màu của tinh bột với iodine',
    subject: 'chem',
    topic: 'starch_iodine',
  },
  'CHEM12-06': {
    title: 'Phản ứng màu biuret của protein',
    subject: 'chem',
    topic: 'biuret_protein',
  },
  'CHEM12-07': {
    title: 'Sodium tác dụng với nước',
    subject: 'chem',
    topic: 'sodium_water',
  },
  'CHEM12-08': {
    title: 'Đinh sắt tác dụng với dung dịch CuSO₄',
    subject: 'chem',
    topic: 'iron_cuso4',
  },
  'CHEM12-09': {
    title: 'Nhôm tác dụng với dung dịch NaOH',
    subject: 'chem',
    topic: 'aluminum_naoh',
  },
  'CHEM12-10': {
    title: 'Phản ứng nhiệt nhôm',
    subject: 'chem',
    topic: 'thermite',
  },
  'CHEM12-11': {
    title: 'Điều chế Fe(OH)₂ và Fe(OH)₃',
    subject: 'chem',
    topic: 'iron_hydroxides',
  },
  'CHEM12-12': {
    title: 'Điện phân dung dịch CuSO₄',
    subject: 'chem',
    topic: 'cuso4_electrolysis',
  },
  'CHEM12-13': {
    title: 'Ăn mòn điện hóa học (pin Zn-Cu)',
    subject: 'chem',
    topic: 'electrochemical_corrosion',
  },
  'SIM-01': {
    title: 'Điều chế ethyl acetate (phản ứng ester hóa)',
    subject: 'chem',
    topic: 'esterification',
  },
  'SIM-02': {
    title: 'Chuyển động ném xiên',
    subject: 'physics',
    topic: 'projectile',
  },
  'SIM-03': {
    title: 'Phản ứng xà phòng hóa chất béo',
    subject: 'chem',
    topic: 'saponification',
  },
  'CHEM11-01': {
    title: 'Độ pH và chất chỉ thị',
    subject: 'chem',
    topic: 'indicator_ph',
  },
  'CHEM11-02': {
    title: 'Chuẩn độ Acid - Base',
    subject: 'chem',
    topic: 'acid_base_titration',
  },
  'CHEM11-03': {
    title: 'Đồng tác dụng với dung dịch HNO₃ đặc',
    subject: 'chem',
    topic: 'copper_hno3',
  },
  'CHEM11-04': {
    title: 'Ammonia tác dụng với HCl đặc (Khói trắng)',
    subject: 'chem',
    topic: 'ammonia_hcl',
  },
  'SIM-08_chem': {
    title: 'Sodium tác dụng với nước',
    subject: 'chem',
    topic: 'sodium_water',
  },
  'SIM-08_math': {
    title: 'Đồ thị hàm số bậc hai',
    subject: 'math',
    topic: 'quadratic',
  },
  'CHEM11-05': {
    title: 'H₂SO₄ đặc tác dụng với đường (Saccharose)',
    subject: 'chem',
    topic: 'h2so4_sucrose',
  },
  'CHEM11-06': {
    title: 'Ethylene tác dụng với nước Bromine',
    subject: 'chem',
    topic: 'ethylene_bromine',
  },
  'CHEM11-07': {
    title: 'Acetylene tác dụng với dung dịch AgNO₃/NH₃',
    subject: 'chem',
    topic: 'acetylene_agno3',
  },
  'CHEM11-08': {
    title: 'Ethanol tác dụng với kim loại Sodium',
    subject: 'chem',
    topic: 'ethanol_sodium',
  },
  'CHEM11-09': {
    title: 'Phenol tác dụng với nước Bromine',
    subject: 'chem',
    topic: 'phenol_bromine',
  },
  'CHEM11-10': {
    title: 'Glycerol tác dụng với Cu(OH)₂',
    subject: 'chem',
    topic: 'glycerol_cuoh2',
  },
  'CHEM11-11': {
    title: 'Tính chất hóa học của Acetic Acid',
    subject: 'chem',
    topic: 'acetic_acid',
  },
  'SIM-04': {
    title: 'Độ pH và chất chỉ thị',
    subject: 'chem',
    topic: 'indicator_ph',
  },
  'SIM-05': {
    title: 'Chuẩn độ Acid - Base',
    subject: 'chem',
    topic: 'acid_base_titration',
  },
  'SIM-06': {
    title: 'Đồng tác dụng với dung dịch HNO₃ đặc',
    subject: 'chem',
    topic: 'copper_hno3',
  },
  'SIM-07': {
    title: 'Ammonia tác dụng với HCl đặc (Khói trắng)',
    subject: 'chem',
    topic: 'ammonia_hcl',
  },
  'SIM-09': {
    title: 'H₂SO₄ đặc tác dụng với đường (Saccharose)',
    subject: 'chem',
    topic: 'h2so4_sucrose',
  },
  'SIM-10': {
    title: 'Ethylene tác dụng với nước Bromine',
    subject: 'chem',
    topic: 'ethylene_bromine',
  },
  'SIM-11': {
    title: 'Acetylene tác dụng với dung dịch AgNO₃/NH₃',
    subject: 'chem',
    topic: 'acetylene_agno3',
  },
  'SIM-12': {
    title: 'Ethanol tác dụng với kim loại Sodium',
    subject: 'chem',
    topic: 'ethanol_sodium',
  },
  'SIM-13': {
    title: 'Phenol tác dụng với nước Bromine',
    subject: 'chem',
    topic: 'phenol_bromine',
  },
  'SIM-14': {
    title: 'Glycerol tác dụng với Cu(OH)₂',
    subject: 'chem',
    topic: 'glycerol_cuoh2',
  },
  'SIM-15': {
    title: 'Tính chất hóa học của Acetic Acid',
    subject: 'chem',
    topic: 'acetic_acid',
  },
  'SIM-22': { title: 'Sự rơi tự do', subject: 'physics', topic: 'free_fall' },
  'SIM-16': {
    title: 'Ném xiên và vòm cổng parabol',
    subject: 'math',
    topic: 'projectile-arch',
  },
  'SIM-17': {
    title: 'Miền nghiệm hệ bất phương trình',
    subject: 'math',
    topic: 'inequality',
  },
  'SIM-18': {
    title: 'Hệ thức lượng tam giác cột cờ',
    subject: 'math',
    topic: 'triangulation',
  },
  'SIM-19': {
    title: 'Định nghĩa Elip ghim đinh',
    subject: 'math',
    topic: 'conic',
  },
  'SIM-20': {
    title: 'Thống kê số liệu mẫu và biểu đồ',
    subject: 'math',
    topic: 'statistics',
  },
  'SIM-21': {
    title: 'Chuyển động thẳng đều & biến đổi đều',
    subject: 'physics',
    topic: 'kinematics',
  },
  'SIM-23': {
    title: 'Chuyển động ném ngang',
    subject: 'physics',
    topic: 'horizontal_projectile',
  },
  'SIM-24': {
    title: 'Định luật II Newton (Xe lăn)',
    subject: 'physics',
    topic: 'newton2',
  },
  'SIM-25': {
    title: 'Vật trượt trên mặt phẳng nghiêng',
    subject: 'physics',
    topic: 'inclined_plane',
  },
  'SIM-26': {
    title: 'Con lắc lò xo nằm ngang',
    subject: 'physics',
    topic: 'spring_pendulum',
  },
  'SIM-27': {
    title: 'Con lắc đơn dao động',
    subject: 'physics',
    topic: 'simple_pendulum',
  },
  'SIM-28': {
    title: 'Chuyển động tròn đều',
    subject: 'physics',
    topic: 'circular_motion',
  },
  'SIM-29': {
    title: 'Va chạm 1D — bảo toàn động lượng',
    subject: 'physics',
    topic: 'collision',
  },
  'SIM-30': {
    title: 'Bảo toàn cơ năng',
    subject: 'physics',
    topic: 'mechanical_energy',
  },
  'SIM-31': {
    title: 'Định luật Boyle (đẳng nhiệt)',
    subject: 'physics',
    topic: 'boyle',
  },
  'SIM-32': {
    title: 'Định luật Charles (đẳng áp)',
    subject: 'physics',
    topic: 'charles',
  },
  'SIM-33': {
    title: 'Thuyết động học phân tử chất khí',
    subject: 'physics',
    topic: 'kinetic_theory',
  },
  'SIM-34': {
    title: 'Sự chuyển thể của chất',
    subject: 'physics',
    topic: 'phase_transition',
  },
  'SIM-35': {
    title: 'Lực từ tác dụng lên dây dẫn',
    subject: 'physics',
    topic: 'magnetic_force',
  },
  'SIM-36': {
    title: 'Lực Lorentz',
    subject: 'physics',
    topic: 'lorentz_force',
  },
  'SIM-37': {
    title: 'Hiện tượng cảm ứng điện từ',
    subject: 'physics',
    topic: 'electromagnetic_induction',
  },
  'SIM-38': {
    title: 'Máy phát điện xoay chiều',
    subject: 'physics',
    topic: 'ac_generator',
  },
  'SIM-39': {
    title: 'Phóng xạ & chu kỳ bán rã',
    subject: 'physics',
    topic: 'radioactive_decay',
  },
  'SIM-40': {
    title: 'Phản ứng phân hạch & nhiệt hạch',
    subject: 'physics',
    topic: 'nuclear_reaction',
  },
  'SIM-41': {
    title: 'Năng lượng liên kết riêng',
    subject: 'physics',
    topic: 'binding_energy',
  },
  'SIM-42': {
    title: 'Dao động điều hòa',
    subject: 'physics',
    topic: 'simple_harmonic_motion',
  },
  'SIM-43': {
    title: 'Dao động tắt dần',
    subject: 'physics',
    topic: 'damped_oscillation',
  },
  'SIM-44': {
    title: 'Hiện tượng cộng hưởng',
    subject: 'physics',
    topic: 'resonance',
  },
  'SIM-45': {
    title: 'Sóng ngang truyền trên dây',
    subject: 'physics',
    topic: 'transverse_wave',
  },
  'SIM-46': { title: 'Sóng dừng', subject: 'physics', topic: 'standing_wave' },
  'SIM-47': {
    title: 'Giao thoa sóng nước',
    subject: 'physics',
    topic: 'wave_interference',
  },
  'SIM-48': {
    title: 'Định luật Coulomb & Lực tương tác',
    subject: 'physics',
    topic: 'coulomb',
  },
  'SIM-49': {
    title: 'Điện trường & Đường sức điện',
    subject: 'physics',
    topic: 'electric_field',
  },
  'SIM-50': {
    title: 'Định luật Ohm cho đoạn mạch',
    subject: 'physics',
    topic: 'ohm_segment',
  },
  'SIM-51': {
    title: 'Mạch ghép điện trở (Nối tiếp / Song song)',
    subject: 'physics',
    topic: 'resistor_circuit',
  },
  'SIM-52': {
    title: 'Định luật Ohm cho toàn mạch',
    subject: 'physics',
    topic: 'ohm_full',
  },
};

const CHEM11_SIM_ALIASES: Record<string, string> = {
  'SIM-01': 'CHEM12-01',
  'SIM-03': 'CHEM12-02',
  'SIM-04': 'CHEM11-01',
  'SIM-05': 'CHEM11-02',
  'SIM-06': 'CHEM11-03',
  'SIM-07': 'CHEM11-04',
  'SIM-09': 'CHEM11-05',
  'SIM-10': 'CHEM11-06',
  'SIM-11': 'CHEM11-07',
  'SIM-12': 'CHEM11-08',
  'SIM-13': 'CHEM11-09',
  'SIM-14': 'CHEM11-10',
  'SIM-15': 'CHEM11-11',
};

function normalizeSimulationId(simId: string): string {
  return CHEM11_SIM_ALIASES[simId] || simId;
}

function getSimulationMetadata(
  simId: string,
  subject?: string,
):
  | { title: string; subject: 'math' | 'physics' | 'chem'; topic: string }
  | undefined {
  simId = normalizeSimulationId(simId);
  if (simId === 'SIM-08') {
    if (subject === 'math') {
      return SIMULATIONS_METADATA['SIM-08_math'];
    }
    return SIMULATIONS_METADATA['SIM-08_chem'];
  }
  return SIMULATIONS_METADATA[simId];
}

const LOCAL_FALLBACK_QUESTIONS: Record<
  string,
  Array<{
    q: string;
    opts: Array<{ k: string; t: string }>;
    correct: string;
    explanation: string;
  }>
> = {
  'SIM-02': [
    {
      q: 'Trong chuyển động ném xiên, véc tơ gia tốc của vật ở đỉnh quỹ đạo có đặc điểm gì?',
      opts: [
        { k: 'a', t: 'Bằng không' },
        { k: 'b', t: 'Hướng xuống dưới và có độ lớn bằng g' },
        { k: 'c', t: 'Hướng nằm ngang' },
        { k: 'd', t: 'Đạt giá trị cực đại' },
      ],
      correct: 'b',
      explanation:
        'Ở mọi điểm trên quỹ đạo ném xiên (bỏ qua sức cản không khí), vật chỉ chịu tác dụng của trọng lực nên gia tốc luôn là gia tốc trọng trường g hướng thẳng đứng xuống dưới.',
    },
    {
      q: 'Khi một vật được ném xiên với vận tốc đầu v0 hợp với phương ngang một góc α, vận tốc của vật tại đỉnh quỹ đạo là bao nhiêu?',
      opts: [
        { k: 'a', t: 'v0' },
        { k: 'b', t: '0' },
        { k: 'c', t: 'v0 * cos(α)' },
        { k: 'd', t: 'v0 * sin(α)' },
      ],
      correct: 'c',
      explanation:
        'Thành phần vận tốc theo phương ngang không đổi và bằng v0 * cos(α), còn thành phần vận tốc theo phương dọc bằng 0 tại đỉnh quỹ đạo.',
    },
    {
      q: 'Tầm xa của vật ném xiên đạt giá trị cực đại khi góc ném α bằng bao nhiêu (bỏ qua sức cản không khí)?',
      opts: [
        { k: 'a', t: '30 độ' },
        { k: 'b', t: '45 độ' },
        { k: 'c', t: '60 độ' },
        { k: 'd', t: '90 độ' },
      ],
      correct: 'b',
      explanation:
        'Công thức tầm xa L = (v0² * sin(2α)) / g. L đạt cực đại khi sin(2α) = 1, tức là 2α = 90 độ, α = 45 độ.',
    },
    {
      q: 'Quỹ đạo chuyển động của một vật ném xiên trong trọng trường (bỏ qua lực cản không khí) có dạng là đường gì?',
      opts: [
        { k: 'a', t: 'Đường thẳng' },
        { k: 'b', t: 'Đường tròn' },
        { k: 'c', t: 'Đường parabol' },
        { k: 'd', t: 'Đường elip' },
      ],
      correct: 'c',
      explanation:
        'Phương trình quỹ đạo có dạng y = -g*x² / (2*v0²*cos²(α)) + x*tan(α), đây là phương trình của một parabol.',
    },
    {
      q: 'Thời gian chuyển động của vật ném xiên từ lúc ném đến khi chạm đất (cùng độ cao) phụ thuộc vào yếu tố nào?',
      opts: [
        { k: 'a', t: 'Chỉ phụ thuộc vận tốc đầu v0' },
        { k: 'b', t: 'Chỉ phụ thuộc góc ném α' },
        { k: 'c', t: 'Phụ thuộc vào v0, góc ném α và gia tốc trọng trường g' },
        { k: 'd', t: 'Không phụ thuộc vào trọng lực' },
      ],
      correct: 'c',
      explanation:
        'Công thức thời gian bay là t = 2 * v0 * sin(α) / g, phụ thuộc vào cả v0, góc ném α và g.',
    },
    {
      q: 'Ở cùng một vận tốc đầu v0, hai góc ném nào sau đây cho cùng một tầm xa trên mặt đất nằm ngang?',
      opts: [
        { k: 'a', t: '30 độ và 60 độ' },
        { k: 'b', t: '30 độ và 45 độ' },
        { k: 'c', t: '45 độ và 60 độ' },
        { k: 'd', t: '15 độ và 45 độ' },
      ],
      correct: 'a',
      explanation:
        'Hai góc ném phụ nhau (α1 + α2 = 90 độ) sẽ cho cùng tầm xa vì sin(2α1) = sin(2α2).',
    },
    {
      q: 'Độ cao cực đại H của vật ném xiên được tính bằng công thức nào dưới đây?',
      opts: [
        { k: 'a', t: 'H = (v0 * sin(α))² / (2g)' },
        { k: 'b', t: 'H = v0² * sin(2α) / g' },
        { k: 'c', t: 'H = v0² * cos²(α) / (2g)' },
        { k: 'd', t: 'H = v0² / g' },
      ],
      correct: 'a',
      explanation:
        'Tại đỉnh quỹ đạo, vy = 0. Sử dụng công thức độc lập thời gian: vy² - v0y² = -2gH => H = v0y² / (2g) = (v0 * sin(α))² / (2g).',
    },
    {
      q: 'Khi tăng góc ném α từ 0 độ đến 90 độ (với cùng v0), độ cao cực đại của vật sẽ thay đổi thế nào?',
      opts: [
        { k: 'a', t: 'Giảm dần' },
        { k: 'b', t: 'Tăng dần' },
        { k: 'c', t: 'Tăng rồi giảm' },
        { k: 'd', t: 'Không thay đổi' },
      ],
      correct: 'b',
      explanation:
        'Độ cao cực đại H tỉ lệ thuận với sin²(α). Khi α tăng từ 0 đến 90 độ, sin(α) tăng từ 0 đến 1 nên H luôn tăng dần.',
    },
    {
      q: 'Lực duy nhất tác dụng lên vật ném xiên khi bỏ qua sức cản không khí là lực nào?',
      opts: [
        { k: 'a', t: 'Lực đẩy Ác-si-mét' },
        { k: 'b', t: 'Lực ma sát' },
        { k: 'c', t: 'Trọng lực' },
        { k: 'd', t: 'Lực quán tính' },
      ],
      correct: 'c',
      explanation:
        'Trong điều kiện lý tưởng bỏ qua sức cản không khí, vật chuyển động tự do trong trọng trường chỉ chịu tác dụng duy nhất của trọng lực.',
    },
    {
      q: 'Trong chuyển động ném xiên, vận tốc của vật đạt giá trị cực tiểu tại thời điểm nào?',
      opts: [
        { k: 'a', t: 'Khi vừa được ném đi' },
        { k: 'b', t: 'Khi chạm đất' },
        { k: 'c', t: 'Khi vật ở đỉnh quỹ đạo' },
        { k: 'd', t: 'Vận tốc không đổi suốt quá trình chuyển động' },
      ],
      correct: 'c',
      explanation:
        'Vận tốc v = √(vx² + vy²). Vì vx = v0 * cos(α) không đổi và vy giảm về 0 tại đỉnh quỹ đạo, nên vận tốc đạt cực tiểu tại đỉnh và bằng vx.',
    },
  ],
  'SIM-21': [
    {
      q: 'Trong chuyển động thẳng biến đổi đều, công thức nào dưới đây xác định vận tốc v tại thời điểm t?',
      opts: [
        { k: 'a', t: 'v = v0 + a*t' },
        { k: 'b', t: 'v = v0 + 0.5*a*t^2' },
        { k: 'c', t: 'v = v0 - a*t' },
        { k: 'd', t: 'v = a*t' },
      ],
      correct: 'a',
      explanation:
        'Công thức vận tốc của chuyển động thẳng biến đổi đều là v = v0 + a*t.',
    },
    {
      q: 'Chuyển động thẳng nhanh dần đều có đặc điểm nào dưới đây về gia tốc a và vận tốc v?',
      opts: [
        { k: 'a', t: 'a ngược dấu với v (a·v < 0)' },
        { k: 'b', t: 'a luôn bằng 0' },
        { k: 'c', t: 'a cùng dấu với v (a·v > 0)' },
        { k: 'd', t: 'a luôn luôn dương' },
      ],
      correct: 'c',
      explanation:
        'Trong chuyển động nhanh dần đều, gia tốc a cùng chiều với vận tốc v, do đó tích số a·v > 0.',
    },
    {
      q: 'Khi một ô tô chuyển động thẳng đều với vận tốc v = 4 m/s, gia tốc của ô tô là bao nhiêu?',
      opts: [
        { k: 'a', t: '4 m/s²' },
        { k: 'b', t: '0 m/s²' },
        { k: 'c', t: '2 m/s²' },
        { k: 'd', t: 'Không xác định được' },
      ],
      correct: 'b',
      explanation:
        'Chuyển động thẳng đều có vận tốc không đổi theo thời gian, do đó gia tốc a = 0.',
    },
  ],
  'CHEM12-01': [
    {
      q: 'Trong phản ứng este hóa giữa axit axetic và ancol etylic, vai trò của axit sunfuric đặc (H2SO4 đặc) là gì?',
      opts: [
        { k: 'a', t: 'Chất xúc tác và hút nước để dịch chuyển cân bằng' },
        { k: 'b', t: 'Chỉ làm chất xúc tác cho phản ứng' },
        { k: 'c', t: 'Chỉ làm chất hút nước' },
        { k: 'd', t: 'Là chất tham gia phản ứng chính' },
      ],
      correct: 'a',
      explanation:
        'H2SO4 đặc vừa đóng vai trò xúc tác làm tăng tốc độ phản ứng, vừa hút nước sinh ra để chuyển dịch cân bằng sang chiều thuận (tăng hiệu suất este).',
    },
    {
      q: 'Công thức cấu tạo của etyl axetat (ethyl acetate) thu được từ phản ứng este hóa giữa CH3COOH và C2H5OH là gì?',
      opts: [
        { k: 'a', t: 'CH3COOCH3' },
        { k: 'b', t: 'CH3COOC2H5' },
        { k: 'c', t: 'HCOOC2H5' },
        { k: 'd', t: 'C2H5COOCH3' },
      ],
      correct: 'b',
      explanation:
        'Axit axetic (CH3COOH) tác dụng ancol etylic (C2H5OH) tạo ra este etyl axetat (CH3COOC2H5) và nước.',
    },
    {
      q: 'Phản ứng este hóa giữa axit cacboxylic và ancol là phản ứng thuộc loại nào dưới đây?',
      opts: [
        { k: 'a', t: 'Phản ứng một chiều' },
        { k: 'b', t: 'Phản ứng thuận nghịch' },
        { k: 'c', t: 'Phản ứng oxi hóa khử' },
        { k: 'd', t: 'Phản ứng thế gốc tự do' },
      ],
      correct: 'b',
      explanation:
        'Phản ứng este hóa là phản ứng thuận nghịch (hai chiều), xảy ra không hoàn toàn và luôn đạt tới trạng thái cân bằng hóa học.',
    },
    {
      q: 'Để tách este etyl axetat ra khỏi hỗn hợp sau phản ứng este hóa, người ta thường dùng phương pháp nào?',
      opts: [
        { k: 'a', t: 'Lọc lấy kết tủa' },
        { k: 'b', t: 'Chưng cất phân đoạn hoặc dùng phễu chiết để tách lớp' },
        { k: 'c', t: 'Kết tinh lại từ dung dịch' },
        { k: 'd', t: 'Khử bằng khí hydro' },
      ],
      correct: 'b',
      explanation:
        'Este etyl axetat ít tan trong nước, nhẹ hơn nước và nổi lên trên, đồng thời có nhiệt độ sôi thấp nên có thể dùng phễu chiết tách lớp hoặc chưng cất.',
    },
    {
      q: 'Trong thí nghiệm điều chế este, tại sao phải ngưng tụ sản phẩm bằng nước đá hoặc ống sinh hàn?',
      opts: [
        { k: 'a', t: 'Để tăng tốc độ phản ứng este hóa' },
        { k: 'b', t: 'Để este bay hơi dễ dàng hơn' },
        {
          k: 'c',
          t: 'Để este chuyển sang dạng lỏng, tránh thất thoát do este rất dễ bay hơi',
        },
        { k: 'd', t: 'Để hòa tan este vào nước' },
      ],
      correct: 'c',
      explanation:
        'Etyl axetat là chất lỏng dễ bay hơi ở nhiệt độ thấp (t_sôi = 77°C), việc làm lạnh giúp ngưng tụ este từ thể hơi sang thể lỏng để thu hồi sản phẩm.',
    },
    {
      q: 'Khi cho dung dịch NaCl bão hòa vào hỗn hợp sau phản ứng este hóa, hiện tượng gì xảy ra?',
      opts: [
        { k: 'a', t: 'Hỗn hợp tan vào nhau hoàn toàn' },
        { k: 'b', t: 'Este bị thủy phân hết' },
        { k: 'c', t: 'Hỗn hợp tách lớp rõ rệt, este nổi lên phía trên' },
        { k: 'd', t: 'Có kết tủa trắng xuất hiện' },
      ],
      correct: 'c',
      explanation:
        'NaCl bão hòa làm tăng khối lượng riêng của dung dịch chất điện li, giảm độ tan của este, giúp este tách lớp nhanh và nổi lên trên.',
    },
    {
      q: 'Hiệu suất của phản ứng este hóa giữa axit axetic và ancol etylic có thể được tăng lên nhờ cách nào sau đây?',
      opts: [
        { k: 'a', t: 'Thêm nước vào hệ phản ứng' },
        {
          k: 'b',
          t: 'Dùng ancol etylic dư hoặc axit axetic dư và loại bỏ este/nước liên tục',
        },
        { k: 'c', t: 'Giảm nhiệt độ phản ứng xuống 0 độ C' },
        { k: 'd', t: 'Dùng dung dịch H2SO4 loãng làm xúc tác' },
      ],
      correct: 'b',
      explanation:
        'Theo nguyên lí Le Chatelier, tăng nồng độ chất phản ứng (dư ancol/axit) hoặc giảm nồng độ sản phẩm (tách nước/este) sẽ dịch chuyển cân bằng theo chiều thuận.',
    },
    {
      q: 'Liên kết hóa học bị bứt ra ở phân tử axit cacboxylic trong phản ứng este hóa là liên kết nào?',
      opts: [
        { k: 'a', t: 'Liên kết O-H của nhóm cacboxyl' },
        { k: 'b', t: 'Liên kết C-OH của nhóm cacboxyl' },
        { k: 'c', t: 'Liên kết C-H của gốc hidrocacbon' },
        { k: 'd', t: 'Liên kết C=O' },
      ],
      correct: 'b',
      explanation:
        'Nghiên cứu bằng đồng vị phóng xạ chỉ ra rằng nhóm OH của phân tử axit kết hợp với H của phân tử ancol để tạo nước, tức là liên kết C-OH ở axit bị đứt.',
    },
    {
      q: 'Este etyl axetat có mùi thơm đặc trưng nào sau đây?',
      opts: [
        { k: 'a', t: 'Mùi chuối chín' },
        { k: 'b', t: 'Mùi hoa nhài' },
        { k: 'c', t: 'Mùi táo chín hoặc quả chín' },
        { k: 'd', t: 'Mùi hoa hồng' },
      ],
      correct: 'c',
      explanation:
        'Etyl axetat tinh khiết có mùi thơm nhẹ như quả táo hoặc quả chín, quả dứa, thường được ứng dụng trong công nghiệp hương liệu.',
    },
    {
      q: 'Nhiệt độ sôi của etyl axetat thấp hơn nhiệt độ sôi của axit axetic và ancol etylic tương ứng là vì lý do gì?',
      opts: [
        { k: 'a', t: 'Phân tử khối của etyl axetat nhỏ hơn' },
        {
          k: 'b',
          t: 'Giữa các phân tử etyl axetat không tạo được liên kết hydro liên phân tử',
        },
        { k: 'c', t: 'Etyl axetat là chất không bền' },
        { k: 'd', t: 'Etyl axetat tan vô hạn trong nước' },
      ],
      correct: 'b',
      explanation:
        'Este không có nguyên tử H linh động gắn với O nên không tạo được liên kết hydro liên phân tử, dẫn tới nhiệt độ sôi thấp hơn ancol và axit tương ứng.',
    },
  ],
  'SIM-08_math': [
    {
      q: 'Đồ thị của hàm số bậc hai y = ax² + bx + c (a ≠ 0) là một parabol có bề lõm quay lên phía trên khi nào?',
      opts: [
        { k: 'a', t: 'a > 0' },
        { k: 'b', t: 'a < 0' },
        { k: 'c', t: 'b > 0' },
        { k: 'd', t: 'c < 0' },
      ],
      correct: 'a',
      explanation:
        'Hệ số a quyết định chiều bề lõm của parabol: a > 0 thì bề lõm hướng lên trên, a < 0 thì bề lõm hướng xuống dưới.',
    },
    {
      q: 'Tọa độ đỉnh I của parabol y = ax² + bx + c là gì?',
      opts: [
        { k: 'a', t: 'I(-b/(2a); -Δ/(4a))' },
        { k: 'b', t: 'I(b/(2a); Δ/(4a))' },
        { k: 'c', t: 'I(-b/a; -Δ/a)' },
        { k: 'd', t: 'I(-b/(2a); -Δ/(2a))' },
      ],
      correct: 'a',
      explanation:
        'Theo lý thuyết hàm số bậc hai, hoành độ đỉnh là x = -b/(2a) và tung độ đỉnh là y = f(-b/(2a)) = -Δ/(4a).',
    },
    {
      q: 'Trục đối xứng của đồ thị hàm số bậc hai y = ax² + bx + c là đường thẳng nào?',
      opts: [
        { k: 'a', t: 'y = -b/(2a)' },
        { k: 'b', t: 'x = -b/(2a)' },
        { k: 'c', t: 'x = b/(2a)' },
        { k: 'd', t: 'x = -Δ/(4a)' },
      ],
      correct: 'b',
      explanation:
        'Trục đối xứng của parabol luôn là đường thẳng đi qua đỉnh và vuông góc với trục hoành, có phương trình x = -b/(2a).',
    },
    {
      q: 'Khi hệ số a < 0, hàm số bậc hai y = ax² + bx + c đạt giá trị lớn nhất tại điểm nào?',
      opts: [
        { k: 'a', t: 'x = -b/(2a)' },
        { k: 'b', t: 'x = b/(2a)' },
        { k: 'c', t: 'x = -Δ/(4a)' },
        { k: 'd', t: 'x = 0' },
      ],
      correct: 'a',
      explanation:
        'Khi a < 0, bề lõm hướng xuống dưới nên đỉnh Parabol là điểm cực đại. Do đó hàm số đạt giá trị lớn nhất y_max = -Δ/(4a) tại x = -b/(2a).',
    },
    {
      q: 'Giao điểm của parabol y = ax² + bx + c với trục tung Oy luôn có tọa độ là bao nhiêu?',
      opts: [
        { k: 'a', t: '(c; 0)' },
        { k: 'b', t: '(0; c)' },
        { k: 'c', t: '(0; 0)' },
        { k: 'd', t: '(-b/(2a); c)' },
      ],
      correct: 'b',
      explanation:
        'Giao điểm với trục tung Oy tương ứng với x = 0. Thay x = 0 vào phương trình ta được y = c. Vậy tọa độ giao điểm là (0; c).',
    },
    {
      q: 'Số giao điểm của parabol y = ax² + bx + c với trục hoành Ox phụ thuộc vào yếu tố nào?',
      opts: [
        { k: 'a', t: 'Chỉ phụ thuộc hệ số a' },
        { k: 'b', t: 'Dấu của biệt thức Δ = b² - 4ac' },
        { k: 'c', t: 'Chỉ phụ thuộc hệ số c' },
        { k: 'd', t: 'Độ dốc của trục đối xứng' },
      ],
      correct: 'b',
      explanation:
        'Hoành độ giao điểm là nghiệm của phương trình ax² + bx + c = 0. Số nghiệm phụ thuộc vào dấu của biệt thức Δ: Δ > 0 có 2 giao điểm, Δ = 0 có 1 giao điểm (tiếp xúc), Δ < 0 không có giao điểm.',
    },
    {
      q: 'Đồ thị hàm số y = 2x² - 4x + 1 có tọa độ đỉnh là bao nhiêu?',
      opts: [
        { k: 'a', t: '(1; -1)' },
        { k: 'b', t: '(2; 1)' },
        { k: 'c', t: '(-1; 7)' },
        { k: 'd', t: '(1; 1)' },
      ],
      correct: 'a',
      explanation:
        'Hoành độ đỉnh x = -b/(2a) = -(-4)/(2*2) = 1. Tung độ đỉnh y = 2*(1)² - 4*(1) + 1 = -1. Vậy đỉnh là (1; -1).',
    },
    {
      q: 'Nếu Parabol đi qua gốc tọa độ O(0; 0) thì hệ số nào chắc chắn bằng 0?',
      opts: [
        { k: 'a', t: 'a = 0' },
        { k: 'b', t: 'b = 0' },
        { k: 'c', t: 'c = 0' },
        { k: 'd', t: 'Cả a, b, c bằng 0' },
      ],
      correct: 'c',
      explanation:
        'Parabol đi qua O(0; 0) nên y(0) = a*0² + b*0 + c = 0 => c = 0.',
    },
    {
      q: 'Hàm số bậc hai y = x² - 2x + 3 nghịch biến trên khoảng nào?',
      opts: [
        { k: 'a', t: '(1; +vô cùng)' },
        { k: 'b', t: '(-vô cùng; 1)' },
        { k: 'c', t: 'R' },
        { k: 'd', t: '(2; +vô cùng)' },
      ],
      correct: 'b',
      explanation:
        'Ở đây a = 1 > 0 nên hàm số nghịch biến trên khoảng (-vô cùng; -b/(2a)) = (-vô cùng; 1) và đồng biến trên (1; +vô cùng).',
    },
    {
      q: 'Khi tịnh tiến đồ thị hàm số y = ax² sang phải 2 đơn vị, ta thu được đồ thị của hàm số nào?',
      opts: [
        { k: 'a', t: 'y = ax² + 2' },
        { k: 'b', t: 'y = a(x - 2)²' },
        { k: 'c', t: 'y = a(x + 2)²' },
        { k: 'd', t: 'y = ax² - 2' },
      ],
      correct: 'b',
      explanation:
        'Tịnh tiến sang phải d đơn vị tương ứng với việc thay x bằng (x - d) trong phương trình hàm số. Ở đây d = 2 nên y = a(x - 2)².',
    },
  ],
  default: [
    {
      q: 'Lực cản của môi trường có tác dụng gì đối với dao động của một con lắc?',
      opts: [
        { k: 'a', t: 'Làm tăng biên độ dao động' },
        {
          k: 'b',
          t: 'Làm giảm dần biên độ và năng lượng dao động theo thời gian',
        },
        { k: 'c', t: 'Giữ cho chu kì dao động không đổi' },
        { k: 'd', t: 'Làm cho con lắc dao động mãi mãi' },
      ],
      correct: 'b',
      explanation:
        'Lực cản sinh công âm làm tiêu hao cơ năng của hệ, khiến biên độ dao động giảm dần theo thời gian, gọi là dao động tắt dần.',
    },
    {
      q: 'Trong các dung dịch sau đây, dung dịch nào có pH lớn hơn 7 ở 25 độ C?',
      opts: [
        { k: 'a', t: 'HCl' },
        { k: 'b', t: 'NaCl' },
        { k: 'c', t: 'NaOH' },
        { k: 'd', t: 'H2SO4' },
      ],
      correct: 'c',
      explanation:
        'NaOH là bazơ mạnh, điện li hoàn toàn giải phóng ion OH-, làm cho nồng độ H+ nhỏ hơn 10^-7 M, do đó pH > 7.',
    },
    {
      q: 'Định luật II Newton được phát biểu dưới dạng hệ thức nào sau đây?',
      opts: [
        { k: 'a', t: 'F = m * a' },
        { k: 'b', t: 'F = m / a' },
        { k: 'c', t: 'F = a / m' },
        { k: 'd', t: 'F = m * v' },
      ],
      correct: 'a',
      explanation:
        'Gia tốc của một vật tỉ lệ thuận với lực tác dụng và tỉ lệ nghịch với khối lượng của vật, tức là a = F / m hay F = m * a.',
    },
    {
      q: 'Phản ứng hóa học nào giải phóng nhiều nhiệt lượng và tạo ra sắt nóng chảy để hàn đường ray?',
      opts: [
        { k: 'a', t: 'Phản ứng este hóa' },
        { k: 'b', t: 'Phản ứng tráng bạc' },
        { k: 'c', t: 'Phản ứng nhiệt nhôm' },
        { k: 'd', t: 'Phản ứng điện phân CuSO4' },
      ],
      correct: 'c',
      explanation:
        'Phản ứng nhiệt nhôm (2Al + Fe2O3 -> Al2O3 + 2Fe) tỏa lượng nhiệt cực lớn (khoảng 2500°C), nung chảy sắt tạo thành, ứng dụng để hàn đường ray tại chỗ.',
    },
    {
      q: 'Khi điện phân dung dịch CuSO4 với các điện cực trơ, chất khí nào thoát ra ở anot (cực dương)?',
      opts: [
        { k: 'a', t: 'H2' },
        { k: 'b', t: 'O2' },
        { k: 'c', t: 'Cl2' },
        { k: 'd', t: 'SO2' },
      ],
      correct: 'b',
      explanation:
        'Tại anot, phân tử nước bị điện phân giải phóng khí O2 và ion H+: 2H2O -> O2 + 4H+ + 4e.',
    },
    {
      q: 'Điểm cực đại của hàm số y = -x² + 2x + 3 có tung độ bằng bao nhiêu?',
      opts: [
        { k: 'a', t: '1' },
        { k: 'b', t: '4' },
        { k: 'c', t: '3' },
        { k: 'd', t: '2' },
      ],
      correct: 'b',
      explanation:
        'Hoành độ đỉnh x = -b/(2a) = 1. Tung độ tương ứng y = -(1)² + 2*(1) + 3 = 4.',
    },
    {
      q: 'Chất nào sau đây tác dụng với Cu(OH)2 ở nhiệt độ thường tạo thành dung dịch màu xanh lam đậm?',
      opts: [
        { k: 'a', t: 'Ethanol' },
        { k: 'b', t: 'Glucose' },
        { k: 'c', t: 'Ethyl acetate' },
        { k: 'd', t: 'Benzen' },
      ],
      correct: 'b',
      explanation:
        'Glucose có nhiều nhóm OH kề nhau (polyancol) nên có khả năng hòa tan Cu(OH)2 ở nhiệt độ thường tạo phức đồng màu xanh lam đặc trưng.',
    },
    {
      q: 'Thí nghiệm bắn phá lá vàng của Rutherford đã chứng minh điều gì về cấu tạo nguyên tử?',
      opts: [
        { k: 'a', t: 'Nguyên tử là một khối đặc khít' },
        {
          k: 'b',
          t: 'Nguyên tử có cấu tạo rỗng, gồm hạt nhân nhỏ bé mang điện tích dương ở trung tâm và các electron quay xung quanh',
        },
        { k: 'c', t: 'Electron nằm cố định ở hạt nhân' },
        { k: 'd', t: 'Nguyên tử không mang điện' },
      ],
      correct: 'b',
      explanation:
        'Hầu hết các hạt α đi thẳng xuyên qua lá vàng, chỉ một số ít bị lệch hướng hoặc bật ngược lại, chứng tỏ phần lớn nguyên tử là khoảng trống, khối lượng tập trung ở hạt nhân mang điện dương rất nhỏ ở tâm.',
    },
    {
      q: 'Hai lực cân bằng là hai lực có đặc điểm nào dưới đây?',
      opts: [
        {
          k: 'a',
          t: 'Cùng giá, ngược chiều, cùng độ lớn, tác dụng vào hai vật khác nhau',
        },
        {
          k: 'b',
          t: 'Cùng giá, cùng chiều, cùng độ lớn, tác dụng vào cùng một vật',
        },
        {
          k: 'c',
          t: 'Cùng giá, ngược chiều, cùng độ lớn, tác dụng vào cùng một vật',
        },
        { k: 'd', t: 'Khác giá, cùng độ lớn' },
      ],
      correct: 'c',
      explanation:
        'Hai lực cân bằng tác dụng lên cùng một vật, cùng giá, ngược chiều và có cùng độ lớn làm vật đứng yên hoặc chuyển động thẳng đều.',
    },
    {
      q: 'Trong phương trình dao động điều hòa x = A * cos(ω * t + φ), đại lượng (ω * t + φ) được gọi là gì?',
      opts: [
        { k: 'a', t: 'Chu kỳ dao động' },
        { k: 'b', t: 'Tần số dao động' },
        { k: 'c', t: 'Pha của dao động tại thời điểm t' },
        { k: 'd', t: 'Biên độ dao động' },
      ],
      correct: 'c',
      explanation:
        'Pha dao động (ω * t + φ) xác định trạng thái dao động (vị trí và chiều chuyển động) của vật tại thời điểm t.',
    },
  ],
};
