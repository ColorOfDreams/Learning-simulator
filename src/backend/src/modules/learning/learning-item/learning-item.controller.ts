import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LearningItemService } from './learning-item.service';

@ApiTags('Learning Items')
@Controller('learning/items')
export class LearningItemController {
  constructor(private readonly learningItemService: LearningItemService) {}

  @Get()
  findAll(
    @Query('topic') topic?: string,
    @Query('patternId') patternId?: string,
    @Query('q') query?: string,
  ) {
    if (query) {
      return this.learningItemService.search(query);
    }

    if (patternId) {
      return this.learningItemService.findByPatternId(patternId);
    }

    if (topic) {
      return this.learningItemService.findByTopic(topic);
    }

    return this.learningItemService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.learningItemService.findById(id);
  }

  @Post('seed/default')
  seedDefaultItems() {
    return this.learningItemService.seedDefaultItems();
  }
}