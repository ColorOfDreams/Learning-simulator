import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ example: 'user' })
  @IsString()
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

  @ApiPropertyOptional({ example: 'SIM-01' })
  @IsOptional()
  @IsString()
  simulationId?: string;

  @ApiPropertyOptional({ type: [ChatMessageDto] })
  @IsOptional()
  @IsArray()
  context?: ChatMessageDto[];
}
