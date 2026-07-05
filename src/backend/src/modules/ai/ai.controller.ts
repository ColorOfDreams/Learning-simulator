import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';
import { ChatRequestDto } from './dto/chat-request.dto';
import { GenerateQuizRequestDto } from './dto/generate-quiz.dto';

@ApiTags('AI')
@Controller('ai')
@UseGuards(ThrottlerGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  analyze(@Body() request: AnalyzeRequestDto) {
    return this.aiService.analyze(request);
  }

  @Post('chat')
  chat(@Body() request: ChatRequestDto) {
    return this.aiService.chat(request);
  }

  @Post('quiz/generate')
  generateQuiz(@Body() request: GenerateQuizRequestDto) {
    return this.aiService.generateQuiz(request);
  }
}
