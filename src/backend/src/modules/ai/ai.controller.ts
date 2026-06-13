import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  analyze(@Body() request: AnalyzeRequestDto) {
    return this.aiService.analyze(request);
  }
}
