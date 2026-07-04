import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Topic } from './topic.entity';
import { TopicsService } from './topics.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('topics')
@Controller('topics')
export class TopicsController extends BaseController<Topic> {
  constructor(private readonly service: TopicsService) {
    super(service);
  }
}
