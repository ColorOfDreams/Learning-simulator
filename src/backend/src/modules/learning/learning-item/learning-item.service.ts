import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { LearningItemEntity } from './learning-item.entity';
import { learningItemSeed } from './learning-item.seed';

@Injectable()
export class LearningItemService {
  constructor(
    @InjectRepository(LearningItemEntity)
    private readonly learningItemRepo: Repository<LearningItemEntity>,
  ) {}

  async findAll() {
    return this.learningItemRepo.find({
      where: {
        isActive: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findById(id: string) {
    return this.learningItemRepo.findOne({
      where: {
        id,
        isActive: true,
      },
    });
  }

  async findByTopic(topic: string) {
    return this.learningItemRepo.find({
      where: {
        topic,
        isActive: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findByPatternId(patternId: string) {
    return this.learningItemRepo.find({
      where: {
        patternId,
        isActive: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async search(query: string) {
    return this.learningItemRepo.find({
      where: [
        {
          title: ILike(`%${query}%`),
          isActive: true,
        },
        {
          text: ILike(`%${query}%`),
          isActive: true,
        },
        {
          topic: ILike(`%${query}%`),
          isActive: true,
        },
      ],
      take: 10,
      order: {
        id: 'ASC',
      },
    });
  }

  async seedDefaultItems() {
    await this.learningItemRepo.upsert(
      learningItemSeed.map((item) => this.learningItemRepo.create(item)),
      ['id'],
    );

    return {
      message: 'Learning items seeded successfully',
      count: learningItemSeed.length,
    };
  }
}
