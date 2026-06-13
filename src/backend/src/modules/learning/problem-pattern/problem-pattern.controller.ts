import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProblemPatternService } from './problem-pattern.service';

@ApiTags('Problem Patterns')
@Controller('learning/problem-patterns')
export class ProblemPatternController {
  constructor(private readonly problemPatternService: ProblemPatternService) {}

  @Get()
  findAll(
    @Query('topic') topic?: string,
    @Query('simulationId') simulationId?: string,
    @Query('q') query?: string,
  ) {
    if (query) {
      return this.problemPatternService.search(query);
    }

    if (simulationId) {
      return this.problemPatternService.findBySimulationId(simulationId);
    }

    if (topic) {
      return this.problemPatternService.findByTopic(topic);
    }

    return this.problemPatternService.findAll();
  }

  @Get(':patternId')
  findById(@Param('patternId') patternId: string) {
    return this.problemPatternService.findById(patternId);
  }

  @Post('seed/default')
  seedDefaultPatterns() {
    return this.problemPatternService.seedDefaultPatterns();
  }
}
