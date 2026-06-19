import { Injectable } from '@nestjs/common';
import { ProblemPatternService } from '../learning/problem-pattern/problem-pattern.service';
import { SimulationTemplateService } from '../learning/simulation-template/simulation-template.service';
import { TheoryChunkService } from '../learning/theory-chunk/theory-chunk.service';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';
import { ChatRequestDto } from './dto/chat-request.dto';
import { LlmService } from './llm.service';
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

@Injectable()
export class AiService {
  constructor(
    private readonly problemPatternService: ProblemPatternService,
    private readonly simulationTemplateService: SimulationTemplateService,
    private readonly theoryChunkService: TheoryChunkService,
    private readonly llmService: LlmService,
  ) { }

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
      render_blocks: this.buildRenderBlocks(answer.steps.length > 0, simulation),
      references: this.toReferences(ragChunks),
    };
  }

  async chat(request: ChatRequestDto) {
    const message = request.message.trim();
    const subject = request.subject ?? 'physics';
    const grade = request.grade ?? 11;
    const topic = this.detectTopic(message);
    const intent = this.detectIntent(message);
    const ragChunks = await this.findRelevantTheoryChunks(message, topic);
    const patterns = await this.findPatternsForTopic(topic, message);
    const selectedPattern = this.selectPattern(
      message,
      this.extractTarget(message),
      patterns,
    );
    const simulationTemplate = selectedPattern?.simulationId
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
      context: request.context ?? [],
      ragChunks,
      selectedPattern,
      allowGeneralKnowledge: true,
    });

    return {
      intent,
      subject,
      grade,
      topic,
      answer:
        llmAnswer ??
        this.buildLocalChatFallback(message, topic, ragChunks, selectedPattern),
      used_llm: Boolean(llmAnswer),
      simulation: simulationTemplate
        ? this.buildSimulation(simulationTemplate, [])
        : undefined,
      references: this.toReferences(ragChunks),
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
      this.hasAny(normalized, [
        'van toc',
        'gia toc',
        'vmax',
        'amax',
        'xva',
      ])
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
        this.findPatternByIds(patterns, ['SHM_POSITION_AT_TIME']) ??
        patterns[0]
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
        this.findPatternByIds(patterns, ['RESONANCE_CONDITION']) ??
        patterns[0]
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
        short_answer: `Dạng bài: ${pattern.name}. ${pattern.mainFormula ?? ''}`,
        steps: [
          `Dạng bài phù hợp: ${pattern.name}.`,
          `Công thức hoặc hướng xử lí chính: ${pattern.mainFormula ?? 'giải thích khái niệm'}.`,
        ],
      };
    }

    return {
      short_answer: 'Xin lỗi, hệ thống chưa tìm thấy dữ liệu phù hợp cho câu hỏi này. Vui lòng thử diễn đạt lại hoặc hỏi câu khác.',
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
        : Object.entries(template.defaultParameters ?? {}).map(([key, value]) => ({
          key,
          label: key,
          value: value as string | number,
        }));
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
    context: { role: 'user' | 'assistant'; content: string }[];
    ragChunks: TheoryChunk[];
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
            `[${index + 1}] ${chunk.title ?? chunk.id}: ${chunk.text}`,
        )
        .join('\n');
      const patternText = payload.selectedPattern
        ? `Dạng bài: ${payload.selectedPattern.name}; công thức/hướng xử lí: ${payload.selectedPattern.mainFormula ?? 'khái niệm'
        }; mục tiêu: ${payload.selectedPattern.target?.join(', ')}`
        : 'Chưa nhận diện chắc dạng bài từ dataset.';
      const generalKnowledgeRule = payload.allowGeneralKnowledge
        ? 'Nếu tài liệu nội bộ không đủ, được dùng kiến thức Vật lí 11 phổ thông, nhưng hãy nói rõ là đang suy luận ngoài dữ liệu nội bộ.'
        : 'Chỉ dùng tài liệu nội bộ; nếu thiếu dữ liệu thì nói chưa đủ căn cứ.';

      const response = await this.llmService.complete([
        {
          role: 'system',
          content: [
            'Bạn là trợ lý học tập cho học sinh lớp 11, chủ đề chính là Chương 1: Dao động.',
            'Ưu tiên trả lời theo dữ liệu nội bộ và dạng bài đã nhận diện.',
            generalKnowledgeRule,
            'Không bịa nguồn, không đi quá xa khỏi Vật lí 11.',
            'Giọng giải thích vui, dễ hiểu, có ví dụ trực quan ngắn; vẫn giữ công thức chính xác.',
            'Không dùng block LaTeX kiểu \\[...\\] hoặc \\(...\\); hãy viết công thức bằng plain text/Unicode, ví dụ v = ±ω√(A² - x²).',
            'Nếu là bài tính, trình bày ngắn theo: nhận dạng dữ kiện, công thức, thay số, kết luận.',
          ].join('\n'),
        },
        {
          role: 'user',
          content: [
            `Môn: ${payload.subject}, lớp: ${payload.grade}`,
            `Intent: ${payload.intent}`,
            `Topic: ${payload.topic}`,
            patternText,
            references
              ? `Tài liệu nội bộ:\n${references}`
              : 'Tài liệu nội bộ: chưa tìm thấy chunk phù hợp.',
            `Câu hỏi của học sinh: ${payload.message}`,
          ].join('\n\n'),
        },
        ...payload.context.slice(-6),
      ]);

      return this.cleanMathText(response);
    } catch {
      return undefined;
    }
  }

  private buildLocalChatFallback(
    message: string,
    topic: string,
    ragChunks: TheoryChunk[],
    selectedPattern?: ProblemPattern,
  ) {
    if (ragChunks.length > 0) {
      const chunk = ragChunks[0];

      return [
        `Mình tìm thấy phần liên quan trong dữ liệu chương 1: ${chunk.title ?? chunk.id}.`,
        chunk.text,
        selectedPattern
          ? `Dạng gần nhất là: ${selectedPattern.name}.`
          : 'Bạn có thể hỏi cụ thể hơn để mình chọn đúng dạng bài.',
      ].join('\n\n');
    }

    return [
      'Xin lỗi, hệ thống chưa tìm thấy dữ liệu phù hợp cho câu hỏi này.',
      `Câu hỏi: ${message}`,
      `Chủ đề dự đoán: ${topic}.`,
      'Vui lòng thử diễn đạt lại hoặc hỏi một câu khác.',
    ].join('\n\n');
  }

  private toReferences(chunks: TheoryChunk[]) {
    return chunks.map((chunk) => ({
      id: chunk.id,
      title: chunk.title ?? chunk.id,
      source: chunk.source?.sourceName,
    }));
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
      .replace(/ð/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/Ä‘/g, 'd');
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

  async chatRaw(request: { message: string; subject?: string; grade?: number }) {
    const msg = request.message.trim();
    const subject = request.subject ?? 'physics';
    const grade = request.grade ?? 11;
    const topic = this.detectTopic(msg);
    const intent = this.detectIntent(msg);
    const ragChunks = await this.findRelevantTheoryChunks(msg, topic);
    const patterns = await this.findPatternsForTopic(topic, msg);
    const selectedPattern = this.selectPattern(msg, this.extractTarget(msg), patterns);

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
      answer: llmAnswer ?? this.buildLocalChatFallback(msg, topic, ragChunks, selectedPattern),
      used_llm: Boolean(llmAnswer),
    };
  }

  async generateGuidance(sceneGraph?: { roomType?: string; objects?: Array<{ modelName: string; properties?: Record<string, unknown> }> }) {
    if (!sceneGraph?.objects?.length) {
      return {
        text: 'Chào bạn! Hãy tạo một thí nghiệm với các dụng cụ để bắt đầu. Vào mục "Tạo thí nghiệm" để chọn dụng cụ phù hợp.',
        steps: [],
      };
    }

    const names = sceneGraph.objects.map((o) => {
      const map: Record<string, string> = {
        Stand: 'Giá đỡ', SimplePendulum: 'Con lắc đơn', SpringPendulum: 'Con lắc lò xo',
        Spring: 'Lò xo', MassBlock: 'Vật nặng', WoodenBlock: 'Khối gỗ',
        Beaker: 'Cốc thủy tinh', Stopwatch: 'Đồng hồ bấm giờ', Ruler: 'Thước đo',
        Protractor: 'Thước đo góc', Dashpot: 'Bộ giảm chấn', DrivingMotor: 'Động cơ rung',
        EnergyMeter: 'Đồng hồ năng lượng',
      };
      return map[o.modelName] ?? o.modelName;
    });

    const hasStand = sceneGraph.objects.some((o) => o.modelName === 'Stand');
    const pendulums = sceneGraph.objects.filter((o) =>
      ['SimplePendulum', 'SpringPendulum', 'Spring'].includes(o.modelName),
    );
    const hasPendulum = pendulums.length > 0;
    const hasMass = sceneGraph.objects.some((o) => o.modelName === 'MassBlock');

    const steps: Array<{ id: string; title: string; description: string; targetEquipment?: string }> = [];

    if (hasStand && hasPendulum) {
      steps.push({
        id: 'attach',
        title: 'Gắn dụng cụ vào giá đỡ',
        description: `Kéo ${pendulums[0].modelName === 'SimplePendulum' ? 'con lắc đơn' : pendulums[0].modelName === 'SpringPendulum' ? 'con lắc lò xo' : 'lò xo'} vào kẹp của giá đỡ. Khi lại gần, dụng cụ sẽ tự động gắn vào.`,
        targetEquipment: pendulums[0].modelName,
      });
      steps.push({
        id: 'play',
        title: 'Bấm Play để quan sát',
        description: 'Nhấn nút Play (▶) trên thanh công cụ để bắt đầu mô phỏng. Quan sát dao động của vật.',
      });
      steps.push({
        id: 'adjust',
        title: 'Điều chỉnh thông số',
        description: 'Thay đổi chiều dài dây hoặc khối lượng để xem chu kì thay đổi như thế nào. Chu kì T = 2π√(l/g) với con lắc đơn.',
      });
    } else if (hasStand && hasMass) {
      steps.push({
        id: 'attach_mass',
        title: 'Gắn vật nặng vào lò xo',
        description: 'Kéo lò xo vào giá đỡ, sau đó kéo vật nặng vào đầu dưới của lò xo.',
      });
      steps.push({ id: 'play', title: 'Bấm Play để quan sát', description: 'Nhấn nút Play (▶) để xem dao động.' });
      steps.push({ id: 'adjust', title: 'Thay đổi khối lượng', description: 'Thử với các khối lượng khác nhau: T = 2π√(m/k).' });
    } else {
      steps.push({
        id: 'explore',
        title: 'Khám phá dụng cụ',
        description: `Phòng thí nghiệm có: ${names.join(', ')}. Hãy kéo thả và khám phá từng dụng cụ.`,
      });
      steps.push({ id: 'play', title: 'Bấm Play để quan sát', description: 'Nhấn Play (▶) để xem chuyển động.' });
    }

    return {
      text: `Chào bạn! Phòng thí nghiệm có: ${names.join(', ')}. Hãy làm theo các bước bên dưới để bắt đầu thí nghiệm dao động điều hòa.`,
      steps,
    };
  }

  async generateExperiment(message: string) {
    if (!this.llmService.isConfigured()) {
      return {
        name: 'Thí nghiệm mới',
        roomType: 'physics',
        explanation: 'LLM chưa được cấu hình. Vui lòng tạo thủ công.',
        objects: [] as Array<{ modelName: string; properties: Record<string, unknown> }>,
      };
    }

    const equipmentList = [
      'Vật lý: Stand, SimplePendulum, SpringPendulum, Spring, MassBlock, WoodenBlock, Stopwatch, Ruler, Protractor, Dashpot, DrivingMotor, EnergyMeter',
      'Hóa học: Beaker, TestTube, ErlenmeyerFlask, RoundFlask, Burette, Pipette, Thermometer, BunsenBurner, pHMeter, Condenser, Mortar, PeriodicTable, ChemicalSolid, ChemicalLiquid, ChemicalGas',
      'Toán học: CoordinatePlane, ParabolaGraph, TrigWave, GeometryTriangle, GeometryCircle, Vector2D, FunctionPlotter, StatisticsChart',
    ].join('\n');

    try {
      const response = await this.llmService.complete([
        { role: 'system', content: `Bạn là trợ lý thiết kế thí nghiệm 3D cho học sinh lớp 11. 
Dụng cụ có sẵn:\n${equipmentList}\n
Dựa trên mô tả của học sinh, hãy chọn dụng cụ và thông số phù hợp.
Trả về CHỈ JSON (không markdown, không giải thích):
{
  "name": "tên thí nghiệm",
  "roomType": "physics|chemistry|math",
  "explanation": "giải thích ngắn 1-2 câu",
  "objects": [
    { "modelName": "tên dụng cụ", "properties": { "key": value } }
  ]
}` },
        { role: 'user', content: message },
      ]);

      const cleaned = (response || '').replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        name: parsed.name || 'Thí nghiệm mới',
        roomType: parsed.roomType || 'physics',
        explanation: parsed.explanation || '',
        objects: (parsed.objects || []).map((obj: any) => ({
          modelName: obj.modelName,
          properties: obj.properties || {},
        })),
      };
    } catch {
      return {
        name: 'Thí nghiệm mới',
        roomType: 'physics',
        explanation: 'Không thể tạo tự động, vui lòng thử lại hoặc tạo thủ công.',
        objects: [],
      };
    }
  }

  private cleanMathText(value?: string) {
    return String(value ?? '').replace(
      /\\\[((?:.|\n)*?)\\\]|\\\(((?:.|\n)*?)\\\)/g,
      (_match, blockFormula, inlineFormula) =>
        this.simplifyLatexFormula(blockFormula || inlineFormula),
    );
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
