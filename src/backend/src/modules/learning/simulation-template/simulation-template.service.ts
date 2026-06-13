import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimulationTemplateEntity } from './simulation-template.entity';
import { simulationTemplateSeed } from './simulation-template.seed';

@Injectable()
export class SimulationTemplateService {
  constructor(
    @InjectRepository(SimulationTemplateEntity)
    private readonly simulationTemplateRepo: Repository<SimulationTemplateEntity>,
  ) {}

  async findAll() {
    return this.simulationTemplateRepo.find({
      where: {
        isActive: true,
      },
      order: {
        simulationId: 'ASC',
      },
    });
  }

  async findById(simulationId: string) {
    return this.simulationTemplateRepo.findOne({
      where: {
        simulationId,
        isActive: true,
      },
    });
  }

  async findByTopic(topic: string) {
    return this.simulationTemplateRepo.find({
      where: {
        topic,
        isActive: true,
      },
    });
  }

  async seedDefaultTemplates() {
    await this.simulationTemplateRepo.upsert(
      simulationTemplateSeed.map((template) =>
        this.simulationTemplateRepo.create(template),
      ),
      ['simulationId'],
    );

    return {
      message: 'Simulation templates seeded successfully',
    };
  }
}
