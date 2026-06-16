import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LearningDatasetSeedService } from './learning-dataset-seed.service';

@ApiTags('learning')
@Controller('learning')
export class LearningController {
  constructor(
    private readonly learningDatasetSeedService: LearningDatasetSeedService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Kiểm tra module learning' })
  health() {
    return { status: 'ok' };
  }

  @Post('seed/chapter1')
  @ApiOperation({
    summary: 'Seed dataset demo chương 1 Dao động Vật lí 11',
  })
  seedChapterOneDataset() {
    return this.learningDatasetSeedService.seedChapterOneDataset();
  }
}
