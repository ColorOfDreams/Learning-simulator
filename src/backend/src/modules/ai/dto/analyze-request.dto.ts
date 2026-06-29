import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ChatMessageDto } from './chat-request.dto';

export class AnalyzeRequestDto {
  @ApiProperty({
    example:
      'Một vật dao động điều hòa theo phương trình x = 5cos(4πt + π/3) cm. Tính chu kì.',
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

  @ApiPropertyOptional({ type: [ChatMessageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  context?: ChatMessageDto[];
}
