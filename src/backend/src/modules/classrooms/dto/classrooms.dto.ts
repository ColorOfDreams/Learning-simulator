import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateClassDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class JoinClassDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  inviteCode!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  studentName!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  studentCode!: string;
}

export class UpdateMemberStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsNotEmpty()
  @IsString()
  status!: 'APPROVED' | 'REJECTED';
}

export class CreateAssignmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  simulationId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class SubmitAssignmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  memberId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  score!: number;
}
