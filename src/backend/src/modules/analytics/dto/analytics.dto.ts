import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum AnalyticsPeriod {
  WEEK = 'week',
  MONTH = 'month',
}

export class PeriodQueryDto {
  @ApiProperty({ enum: AnalyticsPeriod, required: false, default: AnalyticsPeriod.MONTH })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod;
}

export class CompletionQueryDto extends PeriodQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignmentId?: string;
}

export class MonthsQueryDto {
  @ApiProperty({ required: false, default: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  months?: number;
}

export class LimitQueryDto {
  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class ExportQueryDto {
  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsString()
  export?: string;
}
