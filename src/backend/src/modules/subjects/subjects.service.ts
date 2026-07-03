import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './subject.entity';
import { BaseService } from '../../core/base/base.service';

@Injectable()
export class SubjectsService extends BaseService<Subject> {
  constructor(
    @InjectRepository(Subject)
    protected readonly repo: Repository<Subject>,
  ) {
    super(repo);
  }
}
