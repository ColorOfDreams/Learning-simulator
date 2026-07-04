import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiUsageLogEntity } from './entities/ai-usage-log.entity';

// Giá ước tính USD/1K token, dùng cho mục đích hiển thị KPI dashboard,
// KHÔNG phải số tiền chính xác nhà cung cấp tính. Có thể chỉnh qua env
// AI_COST_PER_1K_PROMPT / AI_COST_PER_1K_COMPLETION / AI_COST_PER_1K_EMBEDDING.
const DEFAULT_PROMPT_PRICE_PER_1K = 0.15;
const DEFAULT_COMPLETION_PRICE_PER_1K = 0.6;
const DEFAULT_EMBEDDING_PRICE_PER_1K = 0.15;

@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);

  constructor(
    @InjectRepository(AiUsageLogEntity)
    private readonly repo: Repository<AiUsageLogEntity>,
    private readonly configService: ConfigService,
  ) {}

  estimateCostUsd(
    promptTokens: number,
    completionTokens: number,
    kind: 'chat' | 'embedding' = 'chat',
  ): number {
    const promptPrice = Number(
      kind === 'embedding'
        ? (this.configService.get<string>('AI_COST_PER_1K_EMBEDDING') ??
            DEFAULT_EMBEDDING_PRICE_PER_1K)
        : (this.configService.get<string>('AI_COST_PER_1K_PROMPT') ??
            DEFAULT_PROMPT_PRICE_PER_1K),
    );
    const completionPrice = Number(
      this.configService.get<string>('AI_COST_PER_1K_COMPLETION') ??
        DEFAULT_COMPLETION_PRICE_PER_1K,
    );
    return (
      (promptTokens / 1000) * promptPrice +
      (completionTokens / 1000) * completionPrice
    );
  }

  async log(entry: {
    userId?: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    kind?: 'chat' | 'embedding';
  }): Promise<void> {
    try {
      const totalTokens = entry.promptTokens + entry.completionTokens;
      const estimatedCostUsd = this.estimateCostUsd(
        entry.promptTokens,
        entry.completionTokens,
        entry.kind ?? 'chat',
      );
      await this.repo.save(
        this.repo.create({
          userId: entry.userId,
          model: entry.model,
          promptTokens: entry.promptTokens,
          completionTokens: entry.completionTokens,
          totalTokens,
          estimatedCostUsd,
        }),
      );
    } catch (err) {
      this.logger.warn(`Không thể ghi log AI usage: ${String(err)}`);
    }
  }

  async totalsBetween(
    from: string,
    to: string,
  ): Promise<{ calls: number; totalCostUsd: number }> {
    const row = await this.repo
      .createQueryBuilder('l')
      .select('COUNT(*)', 'calls')
      .addSelect('COALESCE(SUM(l.estimatedCostUsd), 0)', 'totalCostUsd')
      .where("l.createdAt >= :from AND l.createdAt < (:to::date + interval '1 day')", { from, to })
      .getRawOne<{ calls: string; totalCostUsd: string }>();
    return {
      calls: Number(row?.calls ?? 0),
      totalCostUsd: Number(row?.totalCostUsd ?? 0),
    };
  }

  async dailyCostTrend(days: number): Promise<{ date: string; cost: number }[]> {
    const rows = await this.repo
      .createQueryBuilder('l')
      .select("TO_CHAR(l.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COALESCE(SUM(l.estimatedCostUsd), 0)', 'cost')
      .where(`l.createdAt >= (CURRENT_DATE - INTERVAL '${days - 1} days')`)
      .groupBy("TO_CHAR(l.createdAt, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; cost: string }>();
    return rows.map((r) => ({ date: r.date, cost: Number(r.cost) }));
  }
}
