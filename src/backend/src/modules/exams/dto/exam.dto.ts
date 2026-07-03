import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt, Min, Max, IsArray, ValidateNested, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionRefDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  questionId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  score!: number;
}

class ExamSectionDto {
  @ApiProperty({ enum: ['MULTIPLE_CHOICE', 'ESSAY', 'SHORT_ANSWER'] })
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxScore!: number;

  @ApiProperty({ type: [QuestionRefDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionRefDto)
  questions?: QuestionRefDto[];
}

class AiSectionStructureDto {
  @ApiProperty({ enum: ['MULTIPLE_CHOICE', 'ESSAY', 'SHORT_ANSWER'] })
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  count!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxScore!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;
}

export class CreateExamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subject!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  grade!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(180)
  duration?: number;

  @ApiProperty({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  totalScore?: number;

  @ApiProperty({ type: [ExamSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamSectionDto)
  sections!: ExamSectionDto[];
}

export class AiGenerateExamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subject!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  grade!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(180)
  duration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @ApiProperty({ required: false, type: [AiSectionStructureDto], description: 'VD: [{type:"MULTIPLE_CHOICE", count:20, maxScore:5}]' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiSectionStructureDto)
  sections?: AiSectionStructureDto[];
}

export class QueryExamDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  grade?: number;
}
