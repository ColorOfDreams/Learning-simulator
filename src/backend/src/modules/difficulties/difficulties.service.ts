import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Difficulty } from './difficulty.entity';
import { BaseService } from '../../core/base/base.service';

@Injectable()
export class DifficultysService extends BaseService<Difficulty> {
  constructor(
    @InjectRepository(Difficulty)
    protected readonly repo: Repository<Difficulty>,
  ) {
    super(repo);
  }
}
