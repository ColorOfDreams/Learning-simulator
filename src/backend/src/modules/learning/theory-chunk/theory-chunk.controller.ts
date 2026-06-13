import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TheoryChunkService } from './theory-chunk.service';

@ApiTags('Theory Chunks')
@Controller('learning/theory-chunks')
export class TheoryChunkController {
  constructor(private readonly theoryChunkService: TheoryChunkService) {}

  @Get()
  findAll(@Query('topic') topic?: string, @Query('q') query?: string) {
    if (query) {
      return this.theoryChunkService.search(query);
    }

    if (topic) {
      return this.theoryChunkService.findByTopic(topic);
    }

    return this.theoryChunkService.findAll();
  }

  @Get('rag/search')
  searchForRag(@Query('q') query: string, @Query('topic') topic?: string) {
    return this.theoryChunkService.searchForRag(query, topic);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.theoryChunkService.findById(id);
  }

  @Post('seed/default')
  seedDefaultChunks() {
    return this.theoryChunkService.seedDefaultChunks();
  }
}