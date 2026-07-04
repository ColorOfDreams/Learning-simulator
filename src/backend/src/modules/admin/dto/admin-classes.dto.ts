import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ReassignTeacherDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  teacherId!: string;
}

export class UpdateClassLockDto {
  @ApiProperty()
  @IsBoolean()
  isLocked!: boolean;
}
