import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './topic.entity';
import { BaseService } from '../../core/base/base.service';

@Injectable()
export class TopicsService extends BaseService<Topic> {
  constructor(
    @InjectRepository(Topic)
    protected readonly repo: Repository<Topic>,
  ) {
    super(repo);
  }
}
