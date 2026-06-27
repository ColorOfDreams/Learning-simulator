import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Entity('users')
export class UserEntity extends BaseEntity {
  @ApiProperty()
  @Column({ unique: true })
  email!: string;

  @ApiProperty()
  @Column({ nullable: true })
  password?: string;

  @ApiProperty()
  @Column({ nullable: true })
  firstName?: string;

  @ApiProperty()
  @Column({ nullable: true })
  lastName?: string;

  @ApiProperty()
  @Column({ nullable: true })
  picture?: string;

  @ApiProperty()
  @Column({ nullable: true })
  googleId?: string;

  @ApiProperty()
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.STUDENT })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role!: UserRole;

  @ApiProperty({ default: 0 })
  @Column({ type: 'int', default: 0 })
  xp!: number;

  @ApiProperty({ default: 1 })
  @Column({ type: 'int', default: 1 })
  level!: number;

  @ApiProperty({ nullable: true })
  @Column({ type: 'int', default: 11, nullable: true })
  grade!: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'int', default: 0 })
  streak!: number;

  @ApiProperty({ nullable: true })
  @Column({ type: 'date', nullable: true })
  lastActiveDate!: Date | null;

  @ApiProperty({ default: 0 })
  @Column({ type: 'int', default: 0 })
  maxStreak!: number;
}
