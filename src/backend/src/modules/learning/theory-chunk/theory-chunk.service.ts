import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { TheoryChunkEntity } from './theory-chunk.entity';
import { theoryChunkSeed } from './theory-chunk.seed';

@Injectable()
export class TheoryChunkService {
  constructor(
    @InjectRepository(TheoryChunkEntity)
    private readonly theoryChunkRepo: Repository<TheoryChunkEntity>,
  ) {}

  async findAll() {
    return this.theoryChunkRepo.find({
      where: {
        isActive: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findById(id: string) {
    return this.theoryChunkRepo.findOne({
      where: {
        id,
        isActive: true,
      },
    });
  }

  async findByTopic(topic: string) {
    return this.theoryChunkRepo.find({
      where: {
        topic,
        isActive: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async search(query: string) {
    return this.theoryChunkRepo.find({
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
      take: 8,
      order: {
        id: 'ASC',
      },
    });
  }

  async searchForRag(query: string, topic?: string) {
    const chunks = await this.search(query);

    if (!topic) {
      return chunks.slice(0, 5);
    }

    const topicChunks = chunks.filter((chunk) => chunk.topic === topic);

    if (topicChunks.length > 0) {
      return topicChunks.slice(0, 5);
    }

    return chunks.slice(0, 5);
  }

  async seedDefaultChunks() {
    await this.theoryChunkRepo.upsert(
      theoryChunkSeed.map((chunk) => this.theoryChunkRepo.create(chunk)),
      ['id'],
    );

    return {
      message: 'Theory chunks seeded successfully',
      count: theoryChunkSeed.length,
    };
  }
}
