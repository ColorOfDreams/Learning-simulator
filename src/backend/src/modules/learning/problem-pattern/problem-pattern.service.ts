import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProblemPatternEntity } from './problem-pattern.entity';
import { problemPatternSeed } from './problem-pattern.seed';

@Injectable()
export class ProblemPatternService {
  constructor(
    @InjectRepository(ProblemPatternEntity)
    private readonly problemPatternRepo: Repository<ProblemPatternEntity>,
  ) {}
  async findAll() {
    return this.problemPatternRepo.find({
      where: {
        isActive: true,
      },
      order: {
        patternId: 'ASC',
      },
    });
  }

  async findById(patternId: string) {
    return this.problemPatternRepo.findOne({
      where: {
        patternId,
        isActive: true,
      },
    });
  }

  async findByTopic(topic: string) {
    return this.problemPatternRepo.find({
      where: {
        topic,
        isActive: true,
      },
      order: {
        patternId: 'ASC',
      },
    });
  }

  async findBySimulationId(simulationId: string) {
    return this.problemPatternRepo.find({
      where: {
        simulationId,
        isActive: true,
      },
      order: {
        patternId: 'ASC',
      },
    });
  }

  async search(query: string) {
    return this.problemPatternRepo.find({
      where: [
        {
          patternId: ILike(`%${query}%`),
          isActive: true,
        },
        {
          name: ILike(`%${query}%`),
          isActive: true,
        },
        {
          description: ILike(`%${query}%`),
          isActive: true,
        },
        {
          topic: ILike(`%${query}%`),
          isActive: true,
        },
      ],
      take: 10,
      order: {
        patternId: 'ASC',
      },
    });
  }

  async seedDefaultPatterns() {
    await this.problemPatternRepo.upsert(problemPatternSeed, ['patternId']);

    return {
      message: 'Problem patterns seeded successfully',
      count: problemPatternSeed.length,
    };
  }
}
