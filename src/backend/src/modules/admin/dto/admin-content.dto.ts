import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class PublishSimDto {
  @ApiProperty()
  @IsBoolean()
  published!: boolean;
}

export class AssignSimSubjectDto {
  @ApiProperty({ description: 'roomType: physics | chemistry | math' })
  @IsNotEmpty()
  @IsString()
  roomType!: string;
}
