import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyActiveUserEntity } from './entities/daily-active-user.entity';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @InjectRepository(DailyActiveUserEntity)
    private readonly repo: Repository<DailyActiveUserEntity>,
  ) {}

  async trackVisit(userId: string): Promise<void> {
    const date = todayIso();
    try {
      await this.repo
        .createQueryBuilder()
        .insert()
        .into(DailyActiveUserEntity)
        .values({ userId, date })
        .orIgnore()
        .execute();
    } catch (err) {
      this.logger.warn(`Không thể ghi nhận lượt truy cập: ${String(err)}`);
    }
  }

  async countDistinctUsersBetween(from: string, to: string): Promise<number> {
    const row = await this.repo
      .createQueryBuilder('d')
      .select('COUNT(DISTINCT d.userId)', 'count')
      .where('d.date BETWEEN :from AND :to', { from, to })
      .getRawOne<{ count: string }>();
    return Number(row?.count ?? 0);
  }

  async countRowsBetween(from: string, to: string): Promise<number> {
    return this.repo
      .createQueryBuilder('d')
      .where('d.date BETWEEN :from AND :to', { from, to })
      .getCount();
  }

  async dailyTrend(days: number): Promise<{ date: string; count: number }[]> {
    const rows = await this.repo
      .createQueryBuilder('d')
      .select('d.date', 'date')
      .addSelect('COUNT(DISTINCT d.userId)', 'count')
      .where(`d.date >= (CURRENT_DATE - INTERVAL '${days - 1} days')`)
      .groupBy('d.date')
      .orderBy('d.date', 'ASC')
      .getRawMany<{ date: string; count: string }>();
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }
}
