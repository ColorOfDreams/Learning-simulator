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
    const phrase = query.trim();
    if (!phrase) {
      return [];
    }

    // Keyword phrase search is deliberately the first retrieval tier. This keeps
    // /ai/analyze deterministic and avoids a pgvector dependency for the MVP.
    const phraseMatches = await this.searchByKeyword(phrase);
    if (phraseMatches.length > 0) {
      return phraseMatches;
    }

    const tokens = [...new Set(phrase.split(/\s+/).filter((token) => token.length >= 2))];
    const tokenMatches = await Promise.all(
      tokens.map((token) => this.searchByKeyword(token)),
    );
    const byId = new Map<string, TheoryChunkEntity>();
    tokenMatches.flat().forEach((chunk) => byId.set(chunk.id, chunk));
    return [...byId.values()].slice(0, 8);
  }

  private searchByKeyword(query: string) {
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
