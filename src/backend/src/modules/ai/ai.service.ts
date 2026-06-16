import { Injectable } from '@nestjs/common';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';
import {
  AiAnalysisOutput,
  AiGivenValue,
  AiIntent,
  AiSimulation,
} from './types/ai-analysis-output.types';
import { ProblemPatternService } from '../learning/problem-pattern/problem-pattern.service';
import { SimulationTemplateService } from '../learning/simulation-template/simulation-template.service';
import { TheoryChunkService } from '../learning/theory-chunk/theory-chunk.service';

@Injectable()
export class AiService {
  constructor(
    private readonly problemPatternService: ProblemPatternService,
    private readonly simulationTemplateService: SimulationTemplateService,
    private readonly theoryChunkService: TheoryChunkService,
  ) {}

  async analyze(request: AnalyzeRequestDto): Promise<AiAnalysisOutput> {
    const message = request.message.trim();
    const subject = request.subject ?? 'physics';
    const topic = this.detectTopic(message);
    const intent = this.detectIntent(message);
    const given = this.extractGivenValues(message);
    const target = this.extractTarget(message);

    const patterns = await this.problemPatternService.findByTopic(topic);
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
    const answer = this.buildAnswer(message, given, target, selectedPattern);
    const simulation = simulationTemplate
      ? this.buildSimulation(simulationTemplate, given)
      : undefined;

    return {
      intent,
      subject,
      topic,
      confidence: selectedPattern ? 0.86 : 0.62,
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
      references: ragChunks.map((chunk) => ({
        id: chunk.id,
        title: chunk.title ?? chunk.id,
        source: chunk.source?.sourceName,
      })),
    };
  }

  private detectIntent(message: string): AiIntent {
    const normalized = this.normalize(message);
    const asksSimulation = this.hasAny(normalized, [
      'mo phong',
      'simulate',
      'hinh anh',
    ]);
    const asksSolve = this.hasAny(normalized, [
      'tinh',
      'tim',
      'giai',
      'xac dinh',
      'bao nhieu',
    ]);
    const asksExplain = this.hasAny(normalized, ['giai thich', 'tai sao']);

    if (asksSolve && asksSimulation) {
      return 'solve_and_simulate';
    }

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
        'dao dong dieu hoa',
        'con lac lo xo',
        'chu ki',
        'tan so goc',
        'bien do',
        'li do',
      ])
    ) {
      return 'simple_harmonic_motion';
    }

    return 'unknown';
  }

  private extractGivenValues(message: string): AiGivenValue[] {
    const values: AiGivenValue[] = [];

    const equationMatch = message.match(
      /x\s*=\s*([+-]?\d+(?:[,.]\d+)?)\s*cos\s*\(\s*([+-]?(?:\d+(?:[,.]\d+)?)?)\s*π?\s*t\s*([+-]\s*π\s*\/\s*\d+|[+-]\s*\d+(?:[,.]\d+)?)?\s*\)\s*(cm|m)?/i,
    );

    if (equationMatch) {
      const amplitude = this.toNumber(equationMatch[1]);
      const omegaText = equationMatch[2]
        ? `${equationMatch[2].replace(',', '.')}π`
        : 'π';
      const omegaValue = this.piTextToNumber(omegaText);
      const phiText = equationMatch[3]?.replace(/\s/g, '');
      const phiValue = phiText ? this.piTextToNumber(phiText) : undefined;
      const positionUnit = equationMatch[4] ?? 'cm';

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

      if (phiText && phiValue !== undefined) {
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

      if (omegaValue !== undefined) {
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

    return [];
  }

  private selectPattern(
    message: string,
    target: string[],
    patterns: Awaited<ReturnType<ProblemPatternService['findByTopic']>>,
  ) {
    const normalized = this.normalize(message);

    if (target.includes('T')) {
      return (
        patterns.find(
          (pattern) => pattern.patternId === 'SHM_FIND_PERIOD_FROM_EQUATION',
        ) ?? patterns[0]
      );
    }

    if (target.includes('x')) {
      return (
        patterns.find(
          (pattern) => pattern.patternId === 'SHM_POSITION_AT_TIME',
        ) ?? patterns[0]
      );
    }

    if (target.includes('vmax')) {
      return (
        patterns.find((pattern) => pattern.patternId === 'SHM_MAX_VELOCITY') ??
        patterns[0]
      );
    }

    if (this.hasAny(normalized, ['xac dinh', 'tham so'])) {
      return (
        patterns.find(
          (pattern) => pattern.patternId === 'SHM_IDENTIFY_PARAMETERS',
        ) ?? patterns[0]
      );
    }

    return patterns[0];
  }

  private buildAnswer(
    _message: string,
    given: AiGivenValue[],
    target: string[],
    pattern?: Awaited<ReturnType<ProblemPatternService['findByTopic']>>[number],
  ) {
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
          `Từ phương trình dao động, ta xác định được ω = ${omega.value} rad/s.`,
          'Áp dụng công thức T = 2π / ω.',
          `Suy ra T = 2π / ${omega.value} = ${this.formatNumber(period)} s.`,
        ],
      };
    }

    if (pattern) {
      return {
        short_answer:
          'Đã nhận diện được dạng bài. Cần bước LLM/RAG để sinh lời giải chi tiết hơn.',
        steps: [
          `Dạng bài phù hợp: ${pattern.name}.`,
          `Công thức chính: ${pattern.mainFormula ?? 'chưa khai báo'}.`,
        ],
      };
    }

    return {
      short_answer:
        'Chưa đủ dữ kiện để giải chắc chắn. Hệ thống cần thêm mô tả đề bài hoặc dữ kiện vật lí.',
      steps: [],
    };
  }

  private buildSimulation(
    template: NonNullable<
      Awaited<ReturnType<SimulationTemplateService['findById']>>
    >,
    given: AiGivenValue[],
  ): AiSimulation {
    const params = template.defaultParameters.map((parameter) => {
      const extracted =
        given.find((item) => item.key === `${parameter.key}_numeric`) ??
        given.find((item) => item.key === parameter.key);

      return {
        key: parameter.key,
        value: extracted?.value ?? parameter.value,
        unit: parameter.unit,
        label: parameter.label,
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

  private defaultConcepts(topic: string) {
    if (topic === 'simple_harmonic_motion') {
      return ['dao động điều hòa', 'chu kì', 'tần số góc'];
    }

    return [];
  }

  private defaultSkills(target: string[]) {
    if (target.includes('T')) {
      return ['xác định chu kì từ phương trình dao động'];
    }

    return [];
  }

  private normalize(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }

  private hasAny(value: string, keywords: string[]) {
    return keywords.some((keyword) => value.includes(this.normalize(keyword)));
  }

  private toNumber(value: string) {
    return Number(value.replace(',', '.'));
  }

  private piTextToNumber(value: string) {
    const compact = value.replace(/\s/g, '').replace(',', '.');
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
}
