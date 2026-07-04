import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './grade.entity';
import { BaseService } from '../../core/base/base.service';

@Injectable()
export class GradesService extends BaseService<Grade> {
  constructor(
    @InjectRepository(Grade)
    protected readonly repo: Repository<Grade>,
  ) {
    super(repo);
  }
}
