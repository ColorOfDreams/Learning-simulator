import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ example: 'user' })
  @IsString()
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @ApiProperty({ example: 'Vì sao vận tốc cực đại ở vị trí cân bằng?' })
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({
    example: 'Vì sao ở vị trí cân bằng vận tốc cực đại?',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: 'physics', default: 'physics' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 11, default: 11 })
  @IsOptional()
  @IsInt()
  @Min(1)
  grade?: number;

  @ApiPropertyOptional({ example: 'sess_abc123' })
  @IsOptional()
  @IsString()
  session_id?: string;

  @ApiPropertyOptional({ example: 'SIM_PHY11_PENDULUM_BASIC_3D' })
  @IsOptional()
  @IsString()
  simulationId?: string;

  @ApiPropertyOptional({ example: 'grade_11' })
  @IsOptional()
  @IsString()
  student_level?: string;

  @ApiPropertyOptional({ example: 'short_clear', enum: ['short_clear', 'step_by_step', 'exam_focused'] })
  @IsOptional()
  @IsString()
  @IsIn(['short_clear', 'step_by_step', 'exam_focused'])
  preferred_style?: 'short_clear' | 'step_by_step' | 'exam_focused';

  @ApiPropertyOptional({ type: [ChatMessageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  context?: ChatMessageDto[];
}
