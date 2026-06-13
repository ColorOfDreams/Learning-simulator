import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('learning')
@Controller('learning')
export class LearningController {
  @Get('health')
  @ApiOperation({ summary: 'Kiểm tra module learning' })
  health() {
    return { status: 'ok' };
  }
}
