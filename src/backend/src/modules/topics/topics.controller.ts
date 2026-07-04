import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Topic } from './topic.entity';
import { TopicsService } from './topics.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('topics')
@Controller('topics')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TopicsController extends BaseController<Topic> {
  constructor(private readonly service: TopicsService) {
    super(service);
  }
}
