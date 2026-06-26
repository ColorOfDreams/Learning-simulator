import { Injectable } from '@nestjs/common';
import { ProblemPatternService } from '../learning/problem-pattern/problem-pattern.service';
import { SimulationTemplateService } from '../learning/simulation-template/simulation-template.service';
import { TheoryChunkService } from '../learning/theory-chunk/theory-chunk.service';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';
import { ChatRequestDto } from './dto/chat-request.dto';
import { LlmService } from './llm.service';
import { RagRetrievalService } from './rag-retrieval.service';
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
};

interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  targetEquipment?: string;
  condition?: unknown;
}

interface ExperimentSpec {
  name: string;
  roomType: 'physics' | 'chemistry' | 'math';
  explanation: string;
  objects: Array<{ modelName: string; properties: Record<string, unknown> }>;
}

@Injectable()
export class AiService {
  constructor(
    private readonly problemPatternService: ProblemPatternService,
    private readonly simulationTemplateService: SimulationTemplateService,
    private readonly theoryChunkService: TheoryChunkService,
    private readonly llmService: LlmService,
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
    const llmAnswer = await this.generateLlmResponse({
      message,
      topic,
      subject,
      grade,
      intent,
      sessionId: request.session_id,
      simulationId: request.simulationId,
      simulationTitle: simulationTemplate?.title,
      context: request.context ?? [],
      ragChunks,
      selectedPattern,
      allowGeneralKnowledge: false,
    });

    const answer =
      llmAnswer ??
      this.buildLocalChatFallback(message, topic, ragChunks, selectedPattern);
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
      used_llm: Boolean(llmAnswer),
      simulation: simulationTemplate
        ? this.buildSimulation(simulationTemplate, [])
        : undefined,
      references: ragChunks,
      ...debug,
    };
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
      /x\s*=\s*([+-]?\d+(?:[,.]\d+)?)\s*(?:cos|sin)\s*\(\s*([+-]?(?:\d+(?:[,.]\d+)?)?)\s*(Ï€|pi|Ãâ‚¬)?\s*t\s*([+-]\s*(?:Ï€|pi|Ãâ‚¬)\s*\/\s*\d+|[+-]\s*\d+(?:[,.]\d+)?)?\s*\)\s*(cm|m)?/i,
    );

    if (equationMatch) {
      const amplitude = this.toNumber(equationMatch[1]);
      const omegaCoefficient = equationMatch[2]?.replace(',', '.');
      const omegaText = equationMatch[3]
        ? `${omegaCoefficient || ''}Ï€`
        : omegaCoefficient || '1';
      const omegaValue = this.piTextToNumber(omegaText);
      const phiText = equationMatch[4]
        ?.replace(/\s/g, '')
        .replace(/pi|Ãâ‚¬/gi, 'Ï€');
      const phiValue = phiText ? this.piTextToNumber(phiText) : undefined;
      const positionUnit = equationMatch[5] ?? 'cm';

      values.push({
        key: 'A',
        value: amplitude,
        unit: positionUnit,
        label: 'BiÃªn Ä‘á»™',
      });
      values.push({
        key: 'omega',
        value: omegaText,
        unit: 'rad/s',
        label: 'Táº§n sá»‘ gÃ³c',
      });

      if (phiText && phiValue !== undefined && Number.isFinite(phiValue)) {
        values.push({
          key: 'phi',
          value: phiText,
          unit: 'rad',
          label: 'Pha ban Ä‘áº§u',
        });
        values.push({
          key: 'phi_numeric',
          value: Number(phiValue.toFixed(3)),
          unit: 'rad',
          label: 'Pha ban Ä‘áº§u dáº¡ng sá»‘',
        });
      }

      if (omegaValue !== undefined && Number.isFinite(omegaValue)) {
        values.push({
          key: 'omega_numeric',
          value: Number(omegaValue.toFixed(3)),
          unit: 'rad/s',
          label: 'Táº§n sá»‘ gÃ³c dáº¡ng sá»‘',
        });
      }
    }

    const timeMatch = message.match(
      /(?:t|thá»i Ä‘iá»ƒm|thoi diem)\s*=\s*([+-]?\d+(?:[,.]\d+)?)\s*s/i,
    );

    if (timeMatch) {
      values.push({
        key: 't',
        value: this.toNumber(timeMatch[1]),
        unit: 's',
        label: 'Thá»i gian',
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
        short_answer: `Chu kÃ¬ dao Ä‘á»™ng lÃ  T = ${this.formatNumber(period)} s.`,
        steps: [
          `Tá»« phÆ°Æ¡ng trÃ¬nh dao Ä‘á»™ng, ta xÃ¡c Ä‘á»‹nh Ä‘Æ°á»£c omega = ${omega.value} rad/s.`,
          'Ãp dá»¥ng cÃ´ng thá»©c T = 2Ï€ / omega.',
          `Suy ra T = 2Ï€ / ${omega.value} = ${this.formatNumber(period)} s.`,
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
        short_answer: `Táº§n sá»‘ dao Ä‘á»™ng lÃ  f = ${this.formatNumber(
          frequency,
        )} Hz.`,
        steps: [
          `Tá»« phÆ°Æ¡ng trÃ¬nh, omega = ${omega.value} rad/s.`,
          'Ãp dá»¥ng f = omega / 2Ï€.',
          `Suy ra f = ${this.formatNumber(frequency)} Hz.`,
        ],
      };
    }

    if (pattern) {
      return {
        short_answer: `Dáº¡ng bÃ i: ${pattern.name}. ${pattern.mainFormula ?? ''}`,
        steps: [
          `Dáº¡ng bÃ i phÃ¹ há»£p: ${pattern.name}.`,
          `CÃ´ng thá»©c hoáº·c hÆ°á»›ng xá»­ lÃ­ chÃ­nh: ${pattern.mainFormula ?? 'giáº£i thÃ­ch khÃ¡i niá»‡m'}.`,
        ],
      };
    }

    return {
      short_answer:
        'Xin lá»—i, há»‡ thá»‘ng chÆ°a tÃ¬m tháº¥y dá»¯ liá»‡u phÃ¹ há»£p cho cÃ¢u há»i nÃ y. Vui lÃ²ng thá»­ diá»…n Ä‘áº¡t láº¡i hoáº·c há»i cÃ¢u khÃ¡c.',
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
  ) {
    const chunks = await this.theoryChunkService.searchForRag(message, topic);

    if (chunks.length > 0) {
      return chunks;
    }

    if (patternName) {
      const patternChunks = await this.theoryChunkService.searchForRag(
        patternName,
        topic,
      );

      if (patternChunks.length > 0) {
        return patternChunks;
      }
    }

    if (topic !== 'unknown') {
      return this.theoryChunkService.findByTopic(topic);
    }

    return [];
  }

  private async enhanceAnswerWithLlmIfUseful(payload: {
    message: string;
    topic: string;
    intent: AiIntent;
    answer: AiAnswer;
    selectedPattern?: ProblemPattern;
    ragChunks: TheoryChunk[];
  }) {
    if (!this.llmService.isConfigured()) {
      return payload.answer;
    }

    if (!['chat', 'explain', 'solve_and_simulate'].includes(payload.intent)) {
      return payload.answer;
    }

    try {
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

      if (!llmText) return payload.answer;

      return { short_answer: llmText, steps: [] };
    } catch {
      return payload.answer;
    }
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
        ? `PATTERN: ${payload.selectedPattern.name}
FORMULA: ${payload.selectedPattern.mainFormula ?? 'khái niệm'}
TARGET: ${payload.selectedPattern.target?.join(', ')}`
        : '';
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
        patternText,
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
    } catch {
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
          ? `Dáº¡ng gáº§n nháº¥t lÃ : ${selectedPattern.name}.`
          : 'Báº¡n cÃ³ thá»ƒ há»i cá»¥ thá»ƒ hÆ¡n Ä‘á»ƒ mÃ¬nh chá»n Ä‘Ãºng dáº¡ng bÃ i.',
      ].join('\n\n');
    }

    return [
      'Mình chưa tìm thấy đủ dữ liệu trong tài liệu hiện tại để trả lời chắc chắn.',
      'Bạn có thể hỏi lại với chủ đề cụ thể hơn hoặc cung cấp thêm dữ kiện.',
    ].join('\n\n');
  }

  private toReferences(chunks: TheoryChunk[]) {
    return chunks.map((chunk) => {
      const source = chunk.source?.sourceName ?? chunk.source?.fileName;

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

  private findPatternByIds(patterns: ProblemPattern[], ids: string[]) {
    return ids
      .map((id) => patterns.find((pattern) => pattern.patternId === id))
      .find(Boolean);
  }

  private defaultConcepts(topic: string) {
    const topicConcepts: Record<string, string[]> = {
      mechanical_oscillation: ['dao Ä‘á»™ng cÆ¡', 'vá»‹ trÃ­ cÃ¢n báº±ng'],
      simple_harmonic_motion: ['dao Ä‘á»™ng Ä‘iá»u hÃ²a', 'biÃªn Ä‘á»™', 'pha'],
      shm_kinematics: ['li Ä‘á»™', 'váº­n tá»‘c', 'gia tá»‘c'],
      shm_energy: ['cÆ¡ nÄƒng', 'Ä‘á»™ng nÄƒng', 'tháº¿ nÄƒng'],
      spring_oscillator: ['con láº¯c lÃ² xo', 'chu kÃ¬'],
      simple_pendulum: ['con láº¯c Ä‘Æ¡n', 'dao Ä‘á»™ng nhá»'],
      damped_oscillation: ['dao Ä‘á»™ng táº¯t dáº§n'],
      forced_oscillation: ['dao Ä‘á»™ng cÆ°á»¡ng bá»©c'],
      resonance: ['cá»™ng hÆ°á»Ÿng'],
    };

    return topicConcepts[topic] ?? [];
  }

  private defaultSkills(target: string[]) {
    if (target.includes('T')) {
      return ['xÃ¡c Ä‘á»‹nh chu kÃ¬ tá»« phÆ°Æ¡ng trÃ¬nh dao Ä‘á»™ng'];
    }

    if (target.includes('energy')) {
      return ['phÃ¢n tÃ­ch nÄƒng lÆ°á»£ng trong dao Ä‘á»™ng Ä‘iá»u hÃ²a'];
    }

    return [];
  }

  private normalize(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/Ä‘/g, 'd')
      .replace(/Ã°/g, 'd')
      .replace(/Ä/g, 'd')
      .replace(/Ã„â€˜/g, 'd');
  }

  private hasAny(value: string, keywords: string[]) {
    return keywords.some((keyword) => value.includes(this.normalize(keyword)));
  }

  private toNumber(value: string) {
    return Number(value.replace(',', '.'));
  }

  private piTextToNumber(value: string) {
    const compact = value
      .replace(/\s/g, '')
      .replace(',', '.')
      .replace(/pi|Ãâ‚¬/gi, 'Ï€');
    const sign = compact.startsWith('-') ? -1 : 1;
    const unsigned = compact.replace(/^[+-]/, '');

    if (!unsigned.includes('Ï€')) {
      return Number(compact);
    }

    const [coefficientText, denominatorText] = unsigned.split('Ï€/');
    const coefficient =
      coefficientText === '' ? 1 : Number(coefficientText.replace('Ï€', ''));
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

  async chatRaw(request: {
    message: string;
    subject?: string;
    grade?: number;
  }) {
    const msg = request.message.trim();
    const subject = request.subject ?? 'physics';
    const grade = request.grade ?? 11;
    const topic = this.detectTopic(msg);
    const intent = this.detectIntent(msg);
    const ragChunks = await this.ragRetrievalService.retrieveTheoryChunks({
      message: msg,
      subject,
      grade,
      topic,
    });
    const patterns = await this.findPatternsForTopic(topic, msg);
    const selectedPattern = this.selectPattern(
      msg,
      this.extractTarget(msg),
      patterns,
    );

    const llmAnswer = await this.generateLlmResponse({
      message: msg,
      topic,
      subject,
      grade,
      intent,
      context: [],
      ragChunks,
      selectedPattern,
      allowGeneralKnowledge: true,
    });

    return {
      intent,
      topic,
      answer:
        llmAnswer ??
        this.buildLocalChatFallback(msg, topic, ragChunks, selectedPattern),
      used_llm: Boolean(llmAnswer),
    };
  }

  async generateGuidance(sceneGraph?: {
    roomType?: string;
    objects?: Array<{
      modelName: string;
      properties?: Record<string, unknown>;
    }>;
  }) {
    if (!sceneGraph?.objects?.length) {
      return {
        text: 'Chao ban! Hay tao mot thi nghiem voi cac dung cu de bat dau.',
        steps: [],
      };
    }
    if (this.llmService.isConfigured()) {
      try {
        const equipDesc = sceneGraph.objects
          .map((o) => {
            const p = o.properties || {};
            const propStr = (v: unknown): string =>
              typeof v === 'string' || typeof v === 'number' ? String(v) : '';
            const d: string[] = [];
            if (propStr(p.length)) d.push('dai ' + propStr(p.length) + 'm');
            if (propStr(p.mass)) d.push('nang ' + propStr(p.mass) + 'kg');
            if (propStr(p.stiffness))
              d.push('do cung ' + propStr(p.stiffness) + 'N/m');
            if (propStr(p.symbol)) d.push('ky hieu ' + propStr(p.symbol));
            if (propStr(p.volume)) d.push(propStr(p.volume) + 'ml');
            return (
              '- ' + o.modelName + (d.length ? ' (' + d.join(', ') + ')' : '')
            );
          })
          .join('\n');
        const subj =
          sceneGraph.roomType === 'chemistry'
            ? 'Hoa hoc'
            : sceneGraph.roomType === 'math'
              ? 'Toan hoc'
              : 'Vat ly';
        const response = await this.llmService.complete([
          {
            role: 'user',
            content: [
              'Ban la tro ly huong dan thi nghiem. Dung cu hien co:',
              equipDesc,
              'Mon: ' + subj,
              'Tao 3-5 buoc huong dan. Tra ve CHI JSON: { "steps": [{ "id":"...", "title":"...", "description":"...", "targetEquipment":"..." }] }',
            ].join('\n'),
          },
        ]);
        if (response) {
          const cleaned = response.replace(/```json|```/g, '').trim();
          const match = cleaned.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]) as {
              steps?: GuidanceStep[];
            };
            return {
              text: 'Chao ban! Hay lam theo huong dan ben duoi.',
              steps: (parsed.steps || []).map((s: GuidanceStep, i: number) => ({
                id: s.id || 'step_' + (i + 1),
                title: s.title || '',
                description: s.description || '',
                targetEquipment: s.targetEquipment,
                condition: s.condition || null,
              })),
            };
          }
        }
      } catch {
        /* fallback */
      }
    }
    const names = sceneGraph.objects.map(
      (o: { modelName: string; properties?: Record<string, unknown> }) =>
        o.modelName,
    );
    return {
      text:
        'Phong thi nghiem co: ' + names.join(', ') + '. Bat dau kham pha nhe.',
      steps: [
        {
          id: 'explore',
          title: 'Kham pha dung cu',
          description: 'Keo tha va kham pha tung dung cu.',
        },
        {
          id: 'play',
          title: 'Bam Play',
          description: 'Nhan Play de xem mo phong.',
        },
      ],
    };
  }

  async generateExperiment(message: string) {
    if (!this.llmService.isConfigured()) {
      return {
        name: 'Thí nghiệm mới',
        roomType: 'physics',
        explanation: 'LLM chưa được cấu hình. Vui lòng tạo thủ công.',
        objects: [] as Array<{
          modelName: string;
          properties: Record<string, unknown>;
        }>,
        steps: [] as Array<any>,
      };
    }

    const equipmentList = [
      'Vật lý: Stand, SimplePendulum, SpringPendulum, Spring, MassBlock, WoodenBlock, Stopwatch, Ruler, Protractor, Dashpot, DrivingMotor, EnergyMeter',
      'Hóa học: Beaker, TestTube, ErlenmeyerFlask, RoundFlask, Burette, Pipette, Thermometer, BunsenBurner, pHMeter, Condenser, Mortar, PeriodicTable, ChemicalSolid, ChemicalLiquid, ChemicalGas',
      'Toán học: CoordinatePlane, ParabolaGraph, TrigWave, GeometryTriangle, GeometryCircle, Vector2D, FunctionPlotter, StatisticsChart',
    ].join('\n');

    try {
      const response = await this.llmService.complete([
        {
          role: 'system',
          content: `Bạn là trợ lý thiết kế thí nghiệm 3D cho học sinh lớp 11. 
Dụng cụ có sẵn:\n${equipmentList}\n
Dựa trên mô tả của học sinh, hãy chọn dụng cụ và thông số phù hợp. Đồng thời, tự động tạo các bước hướng dẫn thực hành (steps).
Trả về CHỈ JSON (không markdown, không giải thích):
{
  "name": "tên thí nghiệm",
  "roomType": "physics|chemistry|math",
  "explanation": "giải thích ngắn 1-2 câu",
  "objects": [
    { "modelName": "tên dụng cụ", "properties": { "key": value } }
  ],
  "steps": [
    { 
      "id": "step_1", 
      "title": "Tiêu đề bước", 
      "description": "Mô tả chi tiết thao tác", 
      "expectedAction": { "type": "drag_and_drop", "sourceModel": "tên model kéo", "targetModel": "tên model đích" } 
    }
  ]
}`,
        },
        { role: 'user', content: message },
      ]);

      const cleaned = (response || '').replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned) as ExperimentSpec & { steps?: any[] };
      return {
        name: parsed.name || 'Thí nghiệm mới',
        roomType: parsed.roomType || 'physics',
        explanation: parsed.explanation || '',
        objects: (parsed.objects || []).map(
          (obj: {
            modelName: string;
            properties: Record<string, unknown>;
          }) => ({
            modelName: obj.modelName,
            properties: obj.properties || {},
          }),
        ),
        steps: parsed.steps || [],
      };
    } catch {
      return {
        name: 'Thí nghiệm mới',
        roomType: 'physics',
        explanation:
          'Không thể tạo tự động, vui lòng thử lại hoặc tạo thủ công.',
        objects: [],
        steps: [],
      };
    }
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
            String(
              blockFormula || squareFormula || inlineFormula || dollarFormula,
            ),
          ),
      )
      .trim();
  }

  private simplifyLatexFormula(value: string) {
    return value
      .replace(/\\pm/g, 'Â±')
      .replace(/\\omega/g, 'Ï‰')
      .replace(/\\alpha/g, 'Î±')
      .replace(/\\Delta/g, 'Î”')
      .replace(/\\pi/g, 'Ï€')
      .replace(/\\varphi|\\phi/g, 'Ï†')
      .replace(/\\times/g, 'Ã—')
      .replace(/\\cdot/g, 'Â·')
      .replace(/\\sqrt\{([^{}]+)\}/g, 'âˆš($1)')
      .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
      .replace(/\^\{2\}|\^2/g, 'Â²')
      .replace(/\^\{3\}|\^3/g, 'Â³')
      .replace(/\{|\}/g, '')
      .replace(/\\/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
