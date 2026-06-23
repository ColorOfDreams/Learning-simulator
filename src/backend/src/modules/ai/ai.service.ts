import { Injectable } from '@nestjs/common';
import { ProblemPatternService } from '../learning/problem-pattern/problem-pattern.service';
import { SimulationTemplateService } from '../learning/simulation-template/simulation-template.service';
import { TheoryChunkService } from '../learning/theory-chunk/theory-chunk.service';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';
import { ChatRequestDto } from './dto/chat-request.dto';
import { GenerateQuizRequestDto } from './dto/generate-quiz.dto';
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

    if (!selectedPattern) {
      return this.runSearchAssistant(message, subject);
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
    const simulationId = request.simulationId;
    const topic = this.detectTopic(message);
    const intent = this.detectIntent(message);
    const ragChunks = await this.findRelevantTheoryChunks(message, topic);
    const patterns = await this.findPatternsForTopic(topic, message);
    const selectedPattern = this.selectPattern(
      message,
      this.extractTarget(message),
      patterns,
    );
    // Try to get simulation template by either selected pattern or directly by simulationId
    const resolvedSimId = selectedPattern?.simulationId ?? simulationId;
    const simulationTemplate = resolvedSimId
      ? await this.simulationTemplateService.findById(resolvedSimId)
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
      simulationId,
    });

    return {
      intent,
      subject,
      grade,
      topic,
      answer:
        llmAnswer ??
        this.buildLocalChatFallback(message, topic, ragChunks, subject, grade, selectedPattern),
      used_llm: Boolean(llmAnswer),
      simulation: simulationTemplate
        ? this.buildSimulation(simulationTemplate, [])
        : undefined,
      references: this.toReferences(ragChunks),
    };
  }

  async generateQuiz(request: GenerateQuizRequestDto) {
    const simulationId = request.simulationId;
    const subject = request.subject;
    const count = request.count;

    const simMeta = getSimulationMetadata(simulationId, subject);
    const simTitle = simMeta ? simMeta.title : 'Chủ đề khoa học';
    const simSubject = simMeta ? (simMeta.subject === 'chem' ? 'Hóa học' : simMeta.subject === 'math' ? 'Toán học' : 'Vật lý') : 'Khoa học';

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
      `KHÔNG viết thêm bất kỳ giải thích, chào hỏi hay ký tự nào ngoài block JSON. Hãy chắc chắn JSON hợp lệ.`
    ].join('\n');

    let questions: any[] = [];
    let usedLlm = false;

    if (this.llmService.isConfigured()) {
      try {
        const responseText = await this.llmService.complete([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Hãy sinh đúng ${count} câu hỏi trắc nghiệm cho mô phỏng ${simulationId}.` }
        ]);

        if (responseText) {
          const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
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
        short_answer:
          'Đã nhận diện được dạng bài. LLM/RAG sẽ bổ sung lời giải thân thiện hơn nếu đã cấu hình API key.',
        steps: [
          `Dạng bài phù hợp: ${pattern.name}.`,
          `Công thức hoặc hướng xử lí chính: ${pattern.mainFormula ?? 'giải thích khái niệm'
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
    simulationId?: string;
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

      let systemPromptContent = '';
      if (payload.simulationId) {
        const simMeta = getSimulationMetadata(payload.simulationId, payload.subject);
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
          `Giữ câu trả lời súc tích dưới 4-5 câu để hiển thị vừa vặn trong khung chat nhỏ ở thanh sidebar bên phải.`
        ].join('\n');
      } else {
        systemPromptContent = [
          'Bạn là trợ lý học tập cho học sinh lớp 11, chủ đề chính là Chương 1: Dao động.',
          'Ưu tiên trả lời theo dữ liệu nội bộ và dạng bài đã nhận diện.',
          generalKnowledgeRule,
          'Không bịa nguồn, không đi quá xa khỏi Vật lí 11.',
          'Giọng giải thích vui, dễ hiểu, có ví dụ trực quan ngắn; vẫn giữ công thức chính xác.',
          'Không dùng block LaTeX kiểu \\[...\\] hoặc \\(...\\); hãy viết công thức bằng plain text/Unicode, ví dụ v = ±ω√(A² - x²).',
          'Nếu là bài tính, trình bày ngắn theo: nhận dạng dữ kiện, công thức, thay số, kết luận.',
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
        ].join('\n\n')
      });

      const response = await this.llmService.complete([
        {
          role: 'system',
          content: systemPromptContent,
        },
        ...payload.context.slice(-6),
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
    ragChunks: TheoryChunk[],
    subject: string,
    grade: number,
    selectedPattern?: ProblemPattern,
  ) {
    const subjectLabel =
      subject === 'chem'
        ? 'Hóa học'
        : subject === 'math'
        ? 'Toán học'
        : 'Vật lý';

    if (ragChunks.length > 0) {
      const chunk = ragChunks[0];

      return [
        `Mình tìm thấy phần liên quan trong dữ liệu ${subjectLabel} ${grade}: ${chunk.title ?? chunk.id}.`,
        chunk.text,
        selectedPattern
          ? `Dạng gần nhất là: ${selectedPattern.name}.`
          : 'Bạn có thể hỏi cụ thể hơn để mình chọn đúng dạng bài.',
      ].join('\n\n');
    }

    return [
      'Chưa tìm thấy mảnh dữ liệu khớp trong dataset nội bộ.',
      `Câu hỏi: ${message}`,
      `Topic dự đoán: ${topic}.`,
      `Khi bạn điền LLM_API_KEY và khởi động lại server, mình sẽ dùng LLM để giải thích bằng kiến thức ${subjectLabel} ${grade} có kiểm soát.`,
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

  private async runSearchAssistant(message: string, initialSubject?: string): Promise<AiAnalysisOutput> {
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
        'Bạn là trợ lý học tập AI chuyên phân tích yêu cầu học sinh và tìm kiếm mô phỏng tương thích trong kho 20 mô phỏng ảo:',
        '- SIM-01: Điều chế ethyl acetate (phản ứng ester hóa) (Môn: chem, topic: esterification)',
        '- SIM-02: Chuyển động ném xiên (Môn: physics, topic: projectile)',
        '- SIM-03: Phản ứng xà phòng hóa chất béo (Môn: chem, topic: saponification)',
        '- SIM-04: Glucose tác dụng với Cu(OH)₂ (Môn: chem, topic: glucose_cuoh2)',
        '- SIM-05: Phản ứng tráng bạc của glucose (Môn: chem, topic: silver_mirror)',
        '- SIM-06: Phản ứng màu của tinh bột với iodine (Môn: chem, topic: starch_iodine)',
        '- SIM-07: Phản ứng màu biuret của protein (Môn: chem, topic: biuret_protein)',
        '- SIM-08: Đồ thị hàm số bậc hai (Môn: math, topic: quadratic)',
        '- SIM-08: Sodium tác dụng với nước (Môn: chem, topic: sodium_water) -> Lưu ý: Nếu liên quan đến Sodium/Natri tác dụng với nước thì là môn chem, topic: sodium_water.',
        '- SIM-09: Đinh sắt tác dụng với dung dịch CuSO₄ (Môn: chem, topic: iron_copper_sulfate)',
        '- SIM-10: Nhôm tác dụng với dung dịch NaOH (Môn: chem, topic: aluminum_sodium_hydroxide)',
        '- SIM-11: Phản ứng nhiệt nhôm (Al + Fe₂O₃) (Môn: chem, topic: aluminothermic)',
        '- SIM-12: Điều chế Fe(OH)₂ và Fe(OH)₃ (Môn: chem, topic: iron_hydroxides)',
        '- SIM-13: Điện phân dung dịch CuSO₄ (Môn: chem, topic: electrolysis_cuso4)',
        '- SIM-14: Ăn mòn điện hóa học (pin Zn – Cu) (Môn: chem, topic: electrochemical_corrosion)',
        '- SIM-15: Thí nghiệm bắn phá lá vàng (Rutherford) (Môn: chem, topic: gold_foil_experiment)',
        '- SIM-16: Ném xiên và vòm cổng parabol (Môn: math, topic: projectile-arch)',
        '- SIM-17: Miền nghiệm hệ bất phương trình (Môn: math, topic: inequality)',
        '- SIM-18: Hệ thức lượng tam giác cột cờ (Môn: math, topic: triangulation)',
        '- SIM-19: Định nghĩa Elip ghim đinh (Môn: math, topic: conic)',
        '- SIM-20: Thống kê số liệu mẫu và biểu đồ (Môn: math, topic: statistics)',
        '- SIM-21: Chuyển động thẳng đều & biến đổi đều (Môn: physics, topic: kinematics)',
        '',
        'Nhiệm vụ của bạn là:',
        '1. Đánh giá câu hỏi/yêu cầu của học sinh:',
        '- Nếu câu hỏi/yêu cầu hoàn toàn KHÔNG liên quan đến Toán, Lý, Hóa hay khoa học tự nhiên cấp THPT (ví dụ: thời tiết, nấu ăn thường ngày, địa lý, chính trị, thể thao giải trí, kể chuyện cười, đùa cợt, đời sống xã hội...): Hãy trả lời khéo léo và từ chối lịch sự bằng tiếng Việt, hướng dẫn học sinh quay lại chủ đề học tập khoa học. Set "is_related": false, "simulation_id": null.',
        '- Nếu liên quan đến khoa học/Toán/Lý/Hóa nhưng KHÔNG có mô phỏng nào phù hợp trong danh sách 21 mô phỏng trên: Giải thích ngắn gọn lý thuyết/khái niệm đó một cách súc tích, dễ hiểu bằng tiếng Việt (2-4 câu), đồng thời thông báo khéo léo rằng hệ thống chưa có mô phỏng tương tác cho chủ đề này và hẹn gặp lại ở các phiên bản sau, hoặc gợi ý các bài học liên quan có sẵn trong kho. Set "is_related": true, "has_simulation": false, "simulation_id": null.',
        '- Nếu liên quan và có thể liên kết trực tiếp với 1 trong 21 mô phỏng trên: Giải thích kiến thức hoặc trả lời yêu cầu bằng tiếng Việt một cách tự nhiên, sinh động (2-4 câu), giới thiệu mô phỏng đó và khuyên học sinh nhấp nút trải nghiệm mô phỏng bên dưới để hiểu bài sâu sắc hơn. Set "is_related": true, "has_simulation": true, "simulation_id": "SIM-XX" tương ứng.',
        '',
        '2. Hãy trả về kết quả dưới dạng JSON duy nhất với cấu trúc sau:',
        '{',
        '  "is_related": boolean,',
        '  "has_simulation": boolean,',
        '  "simulation_id": "SIM-01" | "SIM-02" | ... | "SIM-21" | null,',
        '  "subject": "physics" | "math" | "chem",',
        '  "topic": string,',
        '  "short_answer": "Lời giải thích tự nhiên, thân thiện bằng tiếng Việt. Sử dụng Unicode cho công thức nếu cần. Tránh dấu LaTeX block.",',
        '  "confidence": number',
        '}',
        '',
        'KHÔNG được viết thêm bất kỳ từ ngữ nào ngoài block JSON. Hãy chắc chắn JSON hợp lệ.'
      ].join('\n');

      try {
        const responseText = await this.llmService.complete([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Yêu cầu của học sinh: "${message}"` }
        ]);

        if (responseText) {
          const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
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
        console.error('LLM parse error or complete failed, using regex fallback:', err);
        isLlm = false;
      }
    }

    if (!isLlm) {
      const normalizedMsg = this.normalize(message);
      const isOutofScope = !this.hasAny(normalizedMsg, [
        'ly', 'vat ly', 'physics', 'hoa', 'chemistry', 'chem', 'toan', 'math',
        'xap phong', 'chat beo', 'sapon', 'fat', 'ethyl', 'ester', 'axit axetic', 'ethanol',
        'glucose', 'cu(oh)2', 'dong', 'glucozo', 'phuc', 'trang bac', 'trang guong', 'agno3',
        'tollens', 'bac nitrat', 'tinh bot', 'iodine', 'i-ot', 'iot', 'biuret', 'protein',
        'long trang trung', 'peptit', 'sodium', 'natri', 'nuoc', 'kim loai kiem', 'dinh sat',
        'sat', 'cuso4', 'fecuso4', 'nhom', 'naoh', 'alnaoh', 'nhiet nhom', 'tecmit', 'fe2o3',
        'fe(oh)2', 'fe(oh)3', 'dien phan', 'an mon', 'dien hoa', 'pin', 'zn', 'cu', 'zn-cu',
        'rutherford', 'la vang', 'ban pha', 'alpha', 'hat nhan', 'bac hai', 'parabol', 'phuong trinh',
        'nghiem', 'dinh', 'nem xien', 'vom', 'vom cong', 'cong parabol', 'quy dao vom', 'mien nghiem',
        'bat phuong trinh', 'he bat phuong trinh', 'he thuc luong', 'cot co', 'tam giac cot co',
        'do chieu cao', 'elip', 'ghim dinh', 'duong conic', 'tieu diem', 'thong ke', 'so lieu mau',
        'bieu do hop', 'box plot', 'quy dao', 'van toc', 'gia toc', 'chu ky', 'chu ki', 'tan so',
        'bien do', 'li do', 'toa do', 'vi tri', 'cuc dai', 'co nang', 'dong nang', 'the nang', 'cong huong'
      ]);

      if (isOutofScope) {
        isRelated = false;
        hasSimulation = false;
        simulationId = null;
        shortAnswer = 'Chào bạn! Mình là Trợ lý AI Phòng Thí Nghiệm. Mình chỉ có thể giải đáp các kiến thức Toán học, Vật lý và Hóa học THPT và hỗ trợ các mô phỏng tương tác. Bạn vui lòng đặt câu hỏi liên quan đến các môn học này nhé!';
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
          shortAnswer = 'Chào bạn! Câu hỏi của bạn thuộc chủ đề khoa học tự nhiên rất thú vị. Tuy nhiên, hiện tại hệ thống chưa có mô phỏng tương tác 3D/ảo trực quan cho chủ đề cụ thể này. Bạn có muốn khám phá các mô phỏng có sẵn như Ném xiên (Vật lý), Parabol (Toán) hay Xà phòng hóa (Hóa học) không?';
          confidence = 0.7;
        }
      }
    }

    let simulationObj: AiSimulation | undefined = undefined;
    if (simulationId) {
      const meta = getSimulationMetadata(simulationId, subject);
      if (meta) {
        simulationObj = {
          simulation_id: simulationId,
          title: meta.title,
          parameters: []
        };
        subject = meta.subject;
        topic = meta.topic;
      } else {
        const dbTemplate = await this.simulationTemplateService.findById(simulationId);
        if (dbTemplate) {
          simulationObj = {
            simulation_id: dbTemplate.simulationId,
            title: dbTemplate.title,
            parameters: []
          };
          subject = dbTemplate.subject;
          topic = dbTemplate.topic;
        }
      }
    }

    return {
      intent: hasSimulation ? 'simulate' : (isRelated ? 'explain' : 'chat'),
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
        ...(simulationObj ? [{ type: 'simulation_card' as const }] : [])
      ],
      references: [],
    };
  }

  private localRegexMatch(normalizedText: string): { simId: string; subject: 'math' | 'physics' | 'chem'; topic: string; title: string } | null {
    if (/xa phong|chat beo|sapon|fat/.test(normalizedText)) {
      return { simId: 'SIM-03', subject: 'chem', topic: 'saponification', title: 'Phản ứng xà phòng hóa chất béo' };
    }
    if (/ethyl|ester|axit axetic|ethanol/.test(normalizedText)) {
      return { simId: 'SIM-01', subject: 'chem', topic: 'esterification', title: 'Điều chế ethyl acetate (phản ứng ester hóa)' };
    }
    if (/glucose.*cu\(oh\)2|dong.*glucozo|phuc.*dong|cu\(oh\)2/.test(normalizedText)) {
      return { simId: 'SIM-04', subject: 'chem', topic: 'glucose_cuoh2', title: 'Glucose tác dụng với Cu(OH)₂' };
    }
    if (/trang bac|trang guong|agno3|tollens|bac nitrat/.test(normalizedText)) {
      return { simId: 'SIM-05', subject: 'chem', topic: 'silver_mirror', title: 'Phản ứng tráng bạc của glucose' };
    }
    if (/tinh bot|iodine|i-ot|iot/.test(normalizedText)) {
      return { simId: 'SIM-06', subject: 'chem', topic: 'starch_iodine', title: 'Phản ứng màu của tinh bột với iodine' };
    }
    if (/biuret|protein|long trang trung|peptit/.test(normalizedText)) {
      return { simId: 'SIM-07', subject: 'chem', topic: 'biuret_protein', title: 'Phản ứng màu biuret của protein' };
    }
    if (/sodium|natri|nuoc|kim loai kiem/.test(normalizedText)) {
      if (/natri|sodium|nuoc|kiem|hoa/.test(normalizedText)) {
        return { simId: 'SIM-08', subject: 'chem', topic: 'sodium_water', title: 'Sodium tác dụng với nước' };
      }
    }
    if (/dinh sat|sat.*cuso4|fecuso4/.test(normalizedText)) {
      return { simId: 'SIM-09', subject: 'chem', topic: 'iron_copper_sulfate', title: 'Đinh sắt tác dụng với dung dịch CuSO₄' };
    }
    if (/nhom.*naoh|alnaoh|nhom tan/.test(normalizedText)) {
      return { simId: 'SIM-10', subject: 'chem', topic: 'aluminum_sodium_hydroxide', title: 'Nhôm tác dụng với dung dịch NaOH' };
    }
    if (/nhiet nhom|tecmit|fe2o3|al \+ fe2o3/.test(normalizedText)) {
      return { simId: 'SIM-11', subject: 'chem', topic: 'aluminothermic', title: 'Phản ứng nhiệt nhôm (Al + Fe₂O₃)' };
    }
    if (/fe\(oh\)2|fe\(oh\)3|sat hydroxide/.test(normalizedText)) {
      return { simId: 'SIM-12', subject: 'chem', topic: 'iron_hydroxides', title: 'Điều chế Fe(OH)₂ và Fe(OH)₃' };
    }
    if (/dien phan.*cuso4|cuso4 dien phan/.test(normalizedText)) {
      return { simId: 'SIM-13', subject: 'chem', topic: 'electrolysis_cuso4', title: 'Điện phân dung dịch CuSO₄' };
    }
    if (/an mon.*dien hoa|pin.*zn.*cu|zn-cu/.test(normalizedText)) {
      return { simId: 'SIM-14', subject: 'chem', topic: 'electrochemical_corrosion', title: 'Ăn mòn điện hóa học (pin Zn – Cu)' };
    }
    if (/rutherford|la vang|ban pha|alpha|hat nhan/.test(normalizedText)) {
      return { simId: 'SIM-15', subject: 'chem', topic: 'gold_foil_experiment', title: 'Thí nghiệm bắn phá lá vàng (Rutherford)' };
    }
    if (/chuan do|axit|bazo|ph\b|hoa/.test(normalizedText)) {
      return { simId: 'SIM-01', subject: 'chem', topic: 'esterification', title: 'Điều chế ethyl acetate (phản ứng ester hóa)' };
    }
    if (/bac hai|parabol|phuong trinh|nghiem|dinh/.test(normalizedText)) {
      return { simId: 'SIM-08', subject: 'math', topic: 'quadratic', title: 'Đồ thị hàm số bậc hai' };
    }
    if (/nem xien.*vom|vom cong|cong parabol|quy dao vom/.test(normalizedText)) {
      return { simId: 'SIM-16', subject: 'math', topic: 'projectile-arch', title: 'Ném xiên và vòm cổng parabol' };
    }
    if (/mien nghiem|bat phuong trinh|he bat phuong trinh/.test(normalizedText)) {
      return { simId: 'SIM-17', subject: 'math', topic: 'inequality', title: 'Miền nghiệm hệ bất phương trình' };
    }
    if (/he thuc luong|cot co|tam giac cot co|do chieu cao/.test(normalizedText)) {
      return { simId: 'SIM-18', subject: 'math', topic: 'triangulation', title: 'Hệ thức lượng tam giác cột cờ' };
    }
    if (/elip|ghim dinh|duong conic|tieu diem/.test(normalizedText)) {
      return { simId: 'SIM-19', subject: 'math', topic: 'conic', title: 'Định nghĩa Elip ghim đinh' };
    }
    if (/thong ke|so lieu mau|bieu do hop|box plot/.test(normalizedText)) {
      return { simId: 'SIM-20', subject: 'math', topic: 'statistics', title: 'Thống kê số liệu mẫu và biểu đồ' };
    }
    if (/thang deu|bien doi deu|kinematics|chuyen dong thang|gia toc|van toc dau/.test(normalizedText)) {
      return { simId: 'SIM-21', subject: 'physics', topic: 'kinematics', title: 'Chuyển động thẳng đều & biến đổi đều' };
    }
    if (/nem xien|quy dao|van toc dau|goc nem/.test(normalizedText)) {
      return { simId: 'SIM-02', subject: 'physics', topic: 'projectile', title: 'Chuyển động ném xiên' };
    }
    return null;
  }

  private buildLocalQuizFallback(simulationId: string, subject?: string, count: number = 3) {
    const key = simulationId === 'SIM-08' && subject === 'math' ? 'SIM-08_math' : simulationId;
    const list = LOCAL_FALLBACK_QUESTIONS[key] || LOCAL_FALLBACK_QUESTIONS['default'];
    const result: typeof list = [];
    for (let i = 0; i < count; i++) {
      result.push(list[i % list.length]);
    }
    return result;
  }
}

const SIMULATIONS_METADATA: Record<string, { title: string; subject: 'math' | 'physics' | 'chem'; topic: string }> = {
  'SIM-01': { title: 'Điều chế ethyl acetate (phản ứng ester hóa)', subject: 'chem', topic: 'esterification' },
  'SIM-02': { title: 'Chuyển động ném xiên', subject: 'physics', topic: 'projectile' },
  'SIM-03': { title: 'Phản ứng xà phòng hóa chất béo', subject: 'chem', topic: 'saponification' },
  'SIM-04': { title: 'Glucose tác dụng với Cu(OH)₂', subject: 'chem', topic: 'glucose_cuoh2' },
  'SIM-05': { title: 'Phản ứng tráng bạc của glucose', subject: 'chem', topic: 'silver_mirror' },
  'SIM-06': { title: 'Phản ứng màu của tinh bột với iodine', subject: 'chem', topic: 'starch_iodine' },
  'SIM-07': { title: 'Phản ứng màu biuret của protein', subject: 'chem', topic: 'biuret_protein' },
  'SIM-08_chem': { title: 'Sodium tác dụng với nước', subject: 'chem', topic: 'sodium_water' },
  'SIM-08_math': { title: 'Đồ thị hàm số bậc hai', subject: 'math', topic: 'quadratic' },
  'SIM-09': { title: 'Đinh sắt tác dụng với dung dịch CuSO₄', subject: 'chem', topic: 'iron_copper_sulfate' },
  'SIM-10': { title: 'Nhôm tác dụng với dung dịch NaOH', subject: 'chem', topic: 'aluminum_sodium_hydroxide' },
  'SIM-11': { title: 'Phản ứng nhiệt nhôm (Al + Fe₂O₃)', subject: 'chem', topic: 'aluminothermic' },
  'SIM-12': { title: 'Điều chế Fe(OH)₂ và Fe(OH)₃', subject: 'chem', topic: 'iron_hydroxides' },
  'SIM-13': { title: 'Điện phân dung dịch CuSO₄', subject: 'chem', topic: 'electrolysis_cuso4' },
  'SIM-14': { title: 'Ăn mòn điện hóa học (pin Zn – Cu)', subject: 'chem', topic: 'electrochemical_corrosion' },
  'SIM-15': { title: 'Thí nghiệm bắn phá lá vàng (Rutherford)', subject: 'chem', topic: 'gold_foil_experiment' },
  'SIM-16': { title: 'Ném xiên và vòm cổng parabol', subject: 'math', topic: 'projectile-arch' },
  'SIM-17': { title: 'Miền nghiệm hệ bất phương trình', subject: 'math', topic: 'inequality' },
  'SIM-18': { title: 'Hệ thức lượng tam giác cột cờ', subject: 'math', topic: 'triangulation' },
  'SIM-19': { title: 'Định nghĩa Elip ghim đinh', subject: 'math', topic: 'conic' },
  'SIM-20': { title: 'Thống kê số liệu mẫu và biểu đồ', subject: 'math', topic: 'statistics' },
  'SIM-21': { title: 'Chuyển động thẳng đều & biến đổi đều', subject: 'physics', topic: 'kinematics' }
};

function getSimulationMetadata(simId: string, subject?: string): { title: string; subject: 'math' | 'physics' | 'chem'; topic: string } | undefined {
  if (simId === 'SIM-08') {
    if (subject === 'math') {
      return SIMULATIONS_METADATA['SIM-08_math'];
    }
    return SIMULATIONS_METADATA['SIM-08_chem'];
  }
  return SIMULATIONS_METADATA[simId];
}

const LOCAL_FALLBACK_QUESTIONS: Record<string, Array<{
  q: string;
  opts: Array<{ k: string; t: string }>;
  correct: string;
  explanation: string;
}>> = {
  'SIM-02': [
    {
      q: "Trong chuyển động ném xiên, véc tơ gia tốc của vật ở đỉnh quỹ đạo có đặc điểm gì?",
      opts: [
        { k: "a", t: "Bằng không" },
        { k: "b", t: "Hướng xuống dưới và có độ lớn bằng g" },
        { k: "c", t: "Hướng nằm ngang" },
        { k: "d", t: "Đạt giá trị cực đại" }
      ],
      correct: "b",
      explanation: "Ở mọi điểm trên quỹ đạo ném xiên (bỏ qua sức cản không khí), vật chỉ chịu tác dụng của trọng lực nên gia tốc luôn là gia tốc trọng trường g hướng thẳng đứng xuống dưới."
    },
    {
      q: "Khi một vật được ném xiên với vận tốc đầu v0 hợp với phương ngang một góc α, vận tốc của vật tại đỉnh quỹ đạo là bao nhiêu?",
      opts: [
        { k: "a", t: "v0" },
        { k: "b", t: "0" },
        { k: "c", t: "v0 * cos(α)" },
        { k: "d", t: "v0 * sin(α)" }
      ],
      correct: "c",
      explanation: "Thành phần vận tốc theo phương ngang không đổi và bằng v0 * cos(α), còn thành phần vận tốc theo phương dọc bằng 0 tại đỉnh quỹ đạo."
    },
    {
      q: "Tầm xa của vật ném xiên đạt giá trị cực đại khi góc ném α bằng bao nhiêu (bỏ qua sức cản không khí)?",
      opts: [
        { k: "a", t: "30 độ" },
        { k: "b", t: "45 độ" },
        { k: "c", t: "60 độ" },
        { k: "d", t: "90 độ" }
      ],
      correct: "b",
      explanation: "Công thức tầm xa L = (v0² * sin(2α)) / g. L đạt cực đại khi sin(2α) = 1, tức là 2α = 90 độ, α = 45 độ."
    },
    {
      q: "Quỹ đạo chuyển động của một vật ném xiên trong trọng trường (bỏ qua lực cản không khí) có dạng là đường gì?",
      opts: [
        { k: "a", t: "Đường thẳng" },
        { k: "b", t: "Đường tròn" },
        { k: "c", t: "Đường parabol" },
        { k: "d", t: "Đường elip" }
      ],
      correct: "c",
      explanation: "Phương trình quỹ đạo có dạng y = -g*x² / (2*v0²*cos²(α)) + x*tan(α), đây là phương trình của một parabol."
    },
    {
      q: "Thời gian chuyển động của vật ném xiên từ lúc ném đến khi chạm đất (cùng độ cao) phụ thuộc vào yếu tố nào?",
      opts: [
        { k: "a", t: "Chỉ phụ thuộc vận tốc đầu v0" },
        { k: "b", t: "Chỉ phụ thuộc góc ném α" },
        { k: "c", t: "Phụ thuộc vào v0, góc ném α và gia tốc trọng trường g" },
        { k: "d", t: "Không phụ thuộc vào trọng lực" }
      ],
      correct: "c",
      explanation: "Công thức thời gian bay là t = 2 * v0 * sin(α) / g, phụ thuộc vào cả v0, góc ném α và g."
    },
    {
      q: "Ở cùng một vận tốc đầu v0, hai góc ném nào sau đây cho cùng một tầm xa trên mặt đất nằm ngang?",
      opts: [
        { k: "a", t: "30 độ và 60 độ" },
        { k: "b", t: "30 độ và 45 độ" },
        { k: "c", t: "45 độ và 60 độ" },
        { k: "d", t: "15 độ và 45 độ" }
      ],
      correct: "a",
      explanation: "Hai góc ném phụ nhau (α1 + α2 = 90 độ) sẽ cho cùng tầm xa vì sin(2α1) = sin(2α2)."
    },
    {
      q: "Độ cao cực đại H của vật ném xiên được tính bằng công thức nào dưới đây?",
      opts: [
        { k: "a", t: "H = (v0 * sin(α))² / (2g)" },
        { k: "b", t: "H = v0² * sin(2α) / g" },
        { k: "c", t: "H = v0² * cos²(α) / (2g)" },
        { k: "d", t: "H = v0² / g" }
      ],
      correct: "a",
      explanation: "Tại đỉnh quỹ đạo, vy = 0. Sử dụng công thức độc lập thời gian: vy² - v0y² = -2gH => H = v0y² / (2g) = (v0 * sin(α))² / (2g)."
    },
    {
      q: "Khi tăng góc ném α từ 0 độ đến 90 độ (với cùng v0), độ cao cực đại của vật sẽ thay đổi thế nào?",
      opts: [
        { k: "a", t: "Giảm dần" },
        { k: "b", t: "Tăng dần" },
        { k: "c", t: "Tăng rồi giảm" },
        { k: "d", t: "Không thay đổi" }
      ],
      correct: "b",
      explanation: "Độ cao cực đại H tỉ lệ thuận với sin²(α). Khi α tăng từ 0 đến 90 độ, sin(α) tăng từ 0 đến 1 nên H luôn tăng dần."
    },
    {
      q: "Lực duy nhất tác dụng lên vật ném xiên khi bỏ qua sức cản không khí là lực nào?",
      opts: [
        { k: "a", t: "Lực đẩy Ác-si-mét" },
        { k: "b", t: "Lực ma sát" },
        { k: "c", t: "Trọng lực" },
        { k: "d", t: "Lực quán tính" }
      ],
      correct: "c",
      explanation: "Trong điều kiện lý tưởng bỏ qua sức cản không khí, vật chuyển động tự do trong trọng trường chỉ chịu tác dụng duy nhất của trọng lực."
    },
    {
      q: "Trong chuyển động ném xiên, vận tốc của vật đạt giá trị cực tiểu tại thời điểm nào?",
      opts: [
        { k: "a", t: "Khi vừa được ném đi" },
        { k: "b", t: "Khi chạm đất" },
        { k: "c", t: "Khi vật ở đỉnh quỹ đạo" },
        { k: "d", t: "Vận tốc không đổi suốt quá trình chuyển động" }
      ],
      correct: "c",
      explanation: "Vận tốc v = √(vx² + vy²). Vì vx = v0 * cos(α) không đổi và vy giảm về 0 tại đỉnh quỹ đạo, nên vận tốc đạt cực tiểu tại đỉnh và bằng vx."
    }
  ],
  'SIM-21': [
    {
      q: "Trong chuyển động thẳng biến đổi đều, công thức nào dưới đây xác định vận tốc v tại thời điểm t?",
      opts: [
        { k: "a", t: "v = v0 + a*t" },
        { k: "b", t: "v = v0 + 0.5*a*t^2" },
        { k: "c", t: "v = v0 - a*t" },
        { k: "d", t: "v = a*t" }
      ],
      correct: "a",
      explanation: "Công thức vận tốc của chuyển động thẳng biến đổi đều là v = v0 + a*t."
    },
    {
      q: "Chuyển động thẳng nhanh dần đều có đặc điểm nào dưới đây về gia tốc a và vận tốc v?",
      opts: [
        { k: "a", t: "a ngược dấu với v (a·v < 0)" },
        { k: "b", t: "a luôn bằng 0" },
        { k: "c", t: "a cùng dấu với v (a·v > 0)" },
        { k: "d", t: "a luôn luôn dương" }
      ],
      correct: "c",
      explanation: "Trong chuyển động nhanh dần đều, gia tốc a cùng chiều với vận tốc v, do đó tích số a·v > 0."
    },
    {
      q: "Khi một ô tô chuyển động thẳng đều với vận tốc v = 4 m/s, gia tốc của ô tô là bao nhiêu?",
      opts: [
        { k: "a", t: "4 m/s²" },
        { k: "b", t: "0 m/s²" },
        { k: "c", t: "2 m/s²" },
        { k: "d", t: "Không xác định được" }
      ],
      correct: "b",
      explanation: "Chuyển động thẳng đều có vận tốc không đổi theo thời gian, do đó gia tốc a = 0."
    }
  ],
  'SIM-01': [
    {
      q: "Trong phản ứng este hóa giữa axit axetic và ancol etylic, vai trò của axit sunfuric đặc (H2SO4 đặc) là gì?",
      opts: [
        { k: "a", t: "Chất xúc tác và hút nước để dịch chuyển cân bằng" },
        { k: "b", t: "Chỉ làm chất xúc tác cho phản ứng" },
        { k: "c", t: "Chỉ làm chất hút nước" },
        { k: "d", t: "Là chất tham gia phản ứng chính" }
      ],
      correct: "a",
      explanation: "H2SO4 đặc vừa đóng vai trò xúc tác làm tăng tốc độ phản ứng, vừa hút nước sinh ra để chuyển dịch cân bằng sang chiều thuận (tăng hiệu suất este)."
    },
    {
      q: "Công thức cấu tạo của etyl axetat (ethyl acetate) thu được từ phản ứng este hóa giữa CH3COOH và C2H5OH là gì?",
      opts: [
        { k: "a", t: "CH3COOCH3" },
        { k: "b", t: "CH3COOC2H5" },
        { k: "c", t: "HCOOC2H5" },
        { k: "d", t: "C2H5COOCH3" }
      ],
      correct: "b",
      explanation: "Axit axetic (CH3COOH) tác dụng ancol etylic (C2H5OH) tạo ra este etyl axetat (CH3COOC2H5) và nước."
    },
    {
      q: "Phản ứng este hóa giữa axit cacboxylic và ancol là phản ứng thuộc loại nào dưới đây?",
      opts: [
        { k: "a", t: "Phản ứng một chiều" },
        { k: "b", t: "Phản ứng thuận nghịch" },
        { k: "c", t: "Phản ứng oxi hóa khử" },
        { k: "d", t: "Phản ứng thế gốc tự do" }
      ],
      correct: "b",
      explanation: "Phản ứng este hóa là phản ứng thuận nghịch (hai chiều), xảy ra không hoàn toàn và luôn đạt tới trạng thái cân bằng hóa học."
    },
    {
      q: "Để tách este etyl axetat ra khỏi hỗn hợp sau phản ứng este hóa, người ta thường dùng phương pháp nào?",
      opts: [
        { k: "a", t: "Lọc lấy kết tủa" },
        { k: "b", t: "Chưng cất phân đoạn hoặc dùng phễu chiết để tách lớp" },
        { k: "c", t: "Kết tinh lại từ dung dịch" },
        { k: "d", t: "Khử bằng khí hydro" }
      ],
      correct: "b",
      explanation: "Este etyl axetat ít tan trong nước, nhẹ hơn nước và nổi lên trên, đồng thời có nhiệt độ sôi thấp nên có thể dùng phễu chiết tách lớp hoặc chưng cất."
    },
    {
      q: "Trong thí nghiệm điều chế este, tại sao phải ngưng tụ sản phẩm bằng nước đá hoặc ống sinh hàn?",
      opts: [
        { k: "a", t: "Để tăng tốc độ phản ứng este hóa" },
        { k: "b", t: "Để este bay hơi dễ dàng hơn" },
        { k: "c", t: "Để este chuyển sang dạng lỏng, tránh thất thoát do este rất dễ bay hơi" },
        { k: "d", t: "Để hòa tan este vào nước" }
      ],
      correct: "c",
      explanation: "Etyl axetat là chất lỏng dễ bay hơi ở nhiệt độ thấp (t_sôi = 77°C), việc làm lạnh giúp ngưng tụ este từ thể hơi sang thể lỏng để thu hồi sản phẩm."
    },
    {
      q: "Khi cho dung dịch NaCl bão hòa vào hỗn hợp sau phản ứng este hóa, hiện tượng gì xảy ra?",
      opts: [
        { k: "a", t: "Hỗn hợp tan vào nhau hoàn toàn" },
        { k: "b", t: "Este bị thủy phân hết" },
        { k: "c", t: "Hỗn hợp tách lớp rõ rệt, este nổi lên phía trên" },
        { k: "d", t: "Có kết tủa trắng xuất hiện" }
      ],
      correct: "c",
      explanation: "NaCl bão hòa làm tăng khối lượng riêng của dung dịch chất điện li, giảm độ tan của este, giúp este tách lớp nhanh và nổi lên trên."
    },
    {
      q: "Hiệu suất của phản ứng este hóa giữa axit axetic và ancol etylic có thể được tăng lên nhờ cách nào sau đây?",
      opts: [
        { k: "a", t: "Thêm nước vào hệ phản ứng" },
        { k: "b", t: "Dùng ancol etylic dư hoặc axit axetic dư và loại bỏ este/nước liên tục" },
        { k: "c", t: "Giảm nhiệt độ phản ứng xuống 0 độ C" },
        { k: "d", t: "Dùng dung dịch H2SO4 loãng làm xúc tác" }
      ],
      correct: "b",
      explanation: "Theo nguyên lí Le Chatelier, tăng nồng độ chất phản ứng (dư ancol/axit) hoặc giảm nồng độ sản phẩm (tách nước/este) sẽ dịch chuyển cân bằng theo chiều thuận."
    },
    {
      q: "Liên kết hóa học bị bứt ra ở phân tử axit cacboxylic trong phản ứng este hóa là liên kết nào?",
      opts: [
        { k: "a", t: "Liên kết O-H của nhóm cacboxyl" },
        { k: "b", t: "Liên kết C-OH của nhóm cacboxyl" },
        { k: "c", t: "Liên kết C-H của gốc hidrocacbon" },
        { k: "d", t: "Liên kết C=O" }
      ],
      correct: "b",
      explanation: "Nghiên cứu bằng đồng vị phóng xạ chỉ ra rằng nhóm OH của phân tử axit kết hợp với H của phân tử ancol để tạo nước, tức là liên kết C-OH ở axit bị đứt."
    },
    {
      q: "Este etyl axetat có mùi thơm đặc trưng nào sau đây?",
      opts: [
        { k: "a", t: "Mùi chuối chín" },
        { k: "b", t: "Mùi hoa nhài" },
        { k: "c", t: "Mùi táo chín hoặc quả chín" },
        { k: "d", t: "Mùi hoa hồng" }
      ],
      correct: "c",
      explanation: "Etyl axetat tinh khiết có mùi thơm nhẹ như quả táo hoặc quả chín, quả dứa, thường được ứng dụng trong công nghiệp hương liệu."
    },
    {
      q: "Nhiệt độ sôi của etyl axetat thấp hơn nhiệt độ sôi của axit axetic và ancol etylic tương ứng là vì lý do gì?",
      opts: [
        { k: "a", t: "Phân tử khối của etyl axetat nhỏ hơn" },
        { k: "b", t: "Giữa các phân tử etyl axetat không tạo được liên kết hydro liên phân tử" },
        { k: "c", t: "Etyl axetat là chất không bền" },
        { k: "d", t: "Etyl axetat tan vô hạn trong nước" }
      ],
      correct: "b",
      explanation: "Este không có nguyên tử H linh động gắn với O nên không tạo được liên kết hydro liên phân tử, dẫn tới nhiệt độ sôi thấp hơn ancol và axit tương ứng."
    }
  ],
  'SIM-08_math': [
    {
      q: "Đồ thị của hàm số bậc hai y = ax² + bx + c (a ≠ 0) là một parabol có bề lõm quay lên phía trên khi nào?",
      opts: [
        { k: "a", t: "a > 0" },
        { k: "b", t: "a < 0" },
        { k: "c", t: "b > 0" },
        { k: "d", t: "c < 0" }
      ],
      correct: "a",
      explanation: "Hệ số a quyết định chiều bề lõm của parabol: a > 0 thì bề lõm hướng lên trên, a < 0 thì bề lõm hướng xuống dưới."
    },
    {
      q: "Tọa độ đỉnh I của parabol y = ax² + bx + c là gì?",
      opts: [
        { k: "a", t: "I(-b/(2a); -Δ/(4a))" },
        { k: "b", t: "I(b/(2a); Δ/(4a))" },
        { k: "c", t: "I(-b/a; -Δ/a)" },
        { k: "d", t: "I(-b/(2a); -Δ/(2a))" }
      ],
      correct: "a",
      explanation: "Theo lý thuyết hàm số bậc hai, hoành độ đỉnh là x = -b/(2a) và tung độ đỉnh là y = f(-b/(2a)) = -Δ/(4a)."
    },
    {
      q: "Trục đối xứng của đồ thị hàm số bậc hai y = ax² + bx + c là đường thẳng nào?",
      opts: [
        { k: "a", t: "y = -b/(2a)" },
        { k: "b", t: "x = -b/(2a)" },
        { k: "c", t: "x = b/(2a)" },
        { k: "d", t: "x = -Δ/(4a)" }
      ],
      correct: "b",
      explanation: "Trục đối xứng của parabol luôn là đường thẳng đi qua đỉnh và vuông góc với trục hoành, có phương trình x = -b/(2a)."
    },
    {
      q: "Khi hệ số a < 0, hàm số bậc hai y = ax² + bx + c đạt giá trị lớn nhất tại điểm nào?",
      opts: [
        { k: "a", t: "x = -b/(2a)" },
        { k: "b", t: "x = b/(2a)" },
        { k: "c", t: "x = -Δ/(4a)" },
        { k: "d", t: "x = 0" }
      ],
      correct: "a",
      explanation: "Khi a < 0, bề lõm hướng xuống dưới nên đỉnh Parabol là điểm cực đại. Do đó hàm số đạt giá trị lớn nhất y_max = -Δ/(4a) tại x = -b/(2a)."
    },
    {
      q: "Giao điểm của parabol y = ax² + bx + c với trục tung Oy luôn có tọa độ là bao nhiêu?",
      opts: [
        { k: "a", t: "(c; 0)" },
        { k: "b", t: "(0; c)" },
        { k: "c", t: "(0; 0)" },
        { k: "d", t: "(-b/(2a); c)" }
      ],
      correct: "b",
      explanation: "Giao điểm với trục tung Oy tương ứng với x = 0. Thay x = 0 vào phương trình ta được y = c. Vậy tọa độ giao điểm là (0; c)."
    },
    {
      q: "Số giao điểm của parabol y = ax² + bx + c với trục hoành Ox phụ thuộc vào yếu tố nào?",
      opts: [
        { k: "a", t: "Chỉ phụ thuộc hệ số a" },
        { k: "b", t: "Dấu của biệt thức Δ = b² - 4ac" },
        { k: "c", t: "Chỉ phụ thuộc hệ số c" },
        { k: "d", t: "Độ dốc của trục đối xứng" }
      ],
      correct: "b",
      explanation: "Hoành độ giao điểm là nghiệm của phương trình ax² + bx + c = 0. Số nghiệm phụ thuộc vào dấu của biệt thức Δ: Δ > 0 có 2 giao điểm, Δ = 0 có 1 giao điểm (tiếp xúc), Δ < 0 không có giao điểm."
    },
    {
      q: "Đồ thị hàm số y = 2x² - 4x + 1 có tọa độ đỉnh là bao nhiêu?",
      opts: [
        { k: "a", t: "(1; -1)" },
        { k: "b", t: "(2; 1)" },
        { k: "c", t: "(-1; 7)" },
        { k: "d", t: "(1; 1)" }
      ],
      correct: "a",
      explanation: "Hoành độ đỉnh x = -b/(2a) = -(-4)/(2*2) = 1. Tung độ đỉnh y = 2*(1)² - 4*(1) + 1 = -1. Vậy đỉnh là (1; -1)."
    },
    {
      q: "Nếu Parabol đi qua gốc tọa độ O(0; 0) thì hệ số nào chắc chắn bằng 0?",
      opts: [
        { k: "a", t: "a = 0" },
        { k: "b", t: "b = 0" },
        { k: "c", t: "c = 0" },
        { k: "d", t: "Cả a, b, c bằng 0" }
      ],
      correct: "c",
      explanation: "Parabol đi qua O(0; 0) nên y(0) = a*0² + b*0 + c = 0 => c = 0."
    },
    {
      q: "Hàm số bậc hai y = x² - 2x + 3 nghịch biến trên khoảng nào?",
      opts: [
        { k: "a", t: "(1; +vô cùng)" },
        { k: "b", t: "(-vô cùng; 1)" },
        { k: "c", t: "R" },
        { k: "d", t: "(2; +vô cùng)" }
      ],
      correct: "b",
      explanation: "Ở đây a = 1 > 0 nên hàm số nghịch biến trên khoảng (-vô cùng; -b/(2a)) = (-vô cùng; 1) và đồng biến trên (1; +vô cùng)."
    },
    {
      q: "Khi tịnh tiến đồ thị hàm số y = ax² sang phải 2 đơn vị, ta thu được đồ thị của hàm số nào?",
      opts: [
        { k: "a", t: "y = ax² + 2" },
        { k: "b", t: "y = a(x - 2)²" },
        { k: "c", t: "y = a(x + 2)²" },
        { k: "d", t: "y = ax² - 2" }
      ],
      correct: "b",
      explanation: "Tịnh tiến sang phải d đơn vị tương ứng với việc thay x bằng (x - d) trong phương trình hàm số. Ở đây d = 2 nên y = a(x - 2)²."
    }
  ],
  'default': [
    {
      q: "Lực cản của môi trường có tác dụng gì đối với dao động của một con lắc?",
      opts: [
        { k: "a", t: "Làm tăng biên độ dao động" },
        { k: "b", t: "Làm giảm dần biên độ và năng lượng dao động theo thời gian" },
        { k: "c", t: "Giữ cho chu kì dao động không đổi" },
        { k: "d", t: "Làm cho con lắc dao động mãi mãi" }
      ],
      correct: "b",
      explanation: "Lực cản sinh công âm làm tiêu hao cơ năng của hệ, khiến biên độ dao động giảm dần theo thời gian, gọi là dao động tắt dần."
    },
    {
      q: "Trong các dung dịch sau đây, dung dịch nào có pH lớn hơn 7 ở 25 độ C?",
      opts: [
        { k: "a", t: "HCl" },
        { k: "b", t: "NaCl" },
        { k: "c", t: "NaOH" },
        { k: "d", t: "H2SO4" }
      ],
      correct: "c",
      explanation: "NaOH là bazơ mạnh, điện li hoàn toàn giải phóng ion OH-, làm cho nồng độ H+ nhỏ hơn 10^-7 M, do đó pH > 7."
    },
    {
      q: "Định luật II Newton được phát biểu dưới dạng hệ thức nào sau đây?",
      opts: [
        { k: "a", t: "F = m * a" },
        { k: "b", t: "F = m / a" },
        { k: "c", t: "F = a / m" },
        { k: "d", t: "F = m * v" }
      ],
      correct: "a",
      explanation: "Gia tốc của một vật tỉ lệ thuận với lực tác dụng và tỉ lệ nghịch với khối lượng của vật, tức là a = F / m hay F = m * a."
    },
    {
      q: "Phản ứng hóa học nào giải phóng nhiều nhiệt lượng và tạo ra sắt nóng chảy để hàn đường ray?",
      opts: [
        { k: "a", t: "Phản ứng este hóa" },
        { k: "b", t: "Phản ứng tráng bạc" },
        { k: "c", t: "Phản ứng nhiệt nhôm" },
        { k: "d", t: "Phản ứng điện phân CuSO4" }
      ],
      correct: "c",
      explanation: "Phản ứng nhiệt nhôm (2Al + Fe2O3 -> Al2O3 + 2Fe) tỏa lượng nhiệt cực lớn (khoảng 2500°C), nung chảy sắt tạo thành, ứng dụng để hàn đường ray tại chỗ."
    },
    {
      q: "Khi điện phân dung dịch CuSO4 với các điện cực trơ, chất khí nào thoát ra ở anot (cực dương)?",
      opts: [
        { k: "a", t: "H2" },
        { k: "b", t: "O2" },
        { k: "c", t: "Cl2" },
        { k: "d", t: "SO2" }
      ],
      correct: "b",
      explanation: "Tại anot, phân tử nước bị điện phân giải phóng khí O2 và ion H+: 2H2O -> O2 + 4H+ + 4e."
    },
    {
      q: "Điểm cực đại của hàm số y = -x² + 2x + 3 có tung độ bằng bao nhiêu?",
      opts: [
        { k: "a", t: "1" },
        { k: "b", t: "4" },
        { k: "c", t: "3" },
        { k: "d", t: "2" }
      ],
      correct: "b",
      explanation: "Hoành độ đỉnh x = -b/(2a) = 1. Tung độ tương ứng y = -(1)² + 2*(1) + 3 = 4."
    },
    {
      q: "Chất nào sau đây tác dụng với Cu(OH)2 ở nhiệt độ thường tạo thành dung dịch màu xanh lam đậm?",
      opts: [
        { k: "a", t: "Ethanol" },
        { k: "b", t: "Glucose" },
        { k: "c", t: "Ethyl acetate" },
        { k: "d", t: "Benzen" }
      ],
      correct: "b",
      explanation: "Glucose có nhiều nhóm OH kề nhau (polyancol) nên có khả năng hòa tan Cu(OH)2 ở nhiệt độ thường tạo phức đồng màu xanh lam đặc trưng."
    },
    {
      q: "Thí nghiệm bắn phá lá vàng của Rutherford đã chứng minh điều gì về cấu tạo nguyên tử?",
      opts: [
        { k: "a", t: "Nguyên tử là một khối đặc khít" },
        { k: "b", t: "Nguyên tử có cấu tạo rỗng, gồm hạt nhân nhỏ bé mang điện tích dương ở trung tâm và các electron quay xung quanh" },
        { k: "c", t: "Electron nằm cố định ở hạt nhân" },
        { k: "d", t: "Nguyên tử không mang điện" }
      ],
      correct: "b",
      explanation: "Hầu hết các hạt α đi thẳng xuyên qua lá vàng, chỉ một số ít bị lệch hướng hoặc bật ngược lại, chứng tỏ phần lớn nguyên tử là khoảng trống, khối lượng tập trung ở hạt nhân mang điện dương rất nhỏ ở tâm."
    },
    {
      q: "Hai lực cân bằng là hai lực có đặc điểm nào dưới đây?",
      opts: [
        { k: "a", t: "Cùng giá, ngược chiều, cùng độ lớn, tác dụng vào hai vật khác nhau" },
        { k: "b", t: "Cùng giá, cùng chiều, cùng độ lớn, tác dụng vào cùng một vật" },
        { k: "c", t: "Cùng giá, ngược chiều, cùng độ lớn, tác dụng vào cùng một vật" },
        { k: "d", t: "Khác giá, cùng độ lớn" }
      ],
      correct: "c",
      explanation: "Hai lực cân bằng tác dụng lên cùng một vật, cùng giá, ngược chiều và có cùng độ lớn làm vật đứng yên hoặc chuyển động thẳng đều."
    },
    {
      q: "Trong phương trình dao động điều hòa x = A * cos(ω * t + φ), đại lượng (ω * t + φ) được gọi là gì?",
      opts: [
        { k: "a", t: "Chu kỳ dao động" },
        { k: "b", t: "Tần số dao động" },
        { k: "c", t: "Pha của dao động tại thời điểm t" },
        { k: "d", t: "Biên độ dao động" }
      ],
      correct: "c",
      explanation: "Pha dao động (ω * t + φ) xác định trạng thái dao động (vị trí và chiều chuyển động) của vật tại thời điểm t."
    }
  ]
};
