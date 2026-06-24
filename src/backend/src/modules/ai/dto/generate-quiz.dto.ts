import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GenerateQuizRequestDto {
  @ApiProperty({ example: 'SIM-03' })
  @IsString()
  simulationId: string;

  @ApiPropertyOptional({ example: 'chem', default: 'chem' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 5, description: 'Number of questions to generate' })
  @IsInt()
  @Min(1)
  @Max(20)
  count: number;
}
