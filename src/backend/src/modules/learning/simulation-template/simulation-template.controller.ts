import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SimulationTemplateService } from './simulation-template.service';

@ApiTags('Simulation Templates')
@Controller('learning/simulation-templates')
export class SimulationTemplateController {
  constructor(
    private readonly simulationTemplateService: SimulationTemplateService,
  ) {}

  @Get()
  findAll(@Query('topic') topic?: string) {
    if (topic) {
      return this.simulationTemplateService.findByTopic(topic);
    }

    return this.simulationTemplateService.findAll();
  }

  @Get(':simulationId')
  findById(@Param('simulationId') simulationId: string) {
    return this.simulationTemplateService.findById(simulationId);
  }

  @Post('seed')
  seedDefaultTemplates() {
    return this.simulationTemplateService.seedDefaultTemplates();
  }
}