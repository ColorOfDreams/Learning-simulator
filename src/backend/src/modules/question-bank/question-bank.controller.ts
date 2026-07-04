import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { QuestionBankService } from './question-bank.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QueryQuestionDto,
  AiGenerateQuestionsDto,
  BulkImportDto,
} from './dto/question-bank.dto';

import { BaseController } from '../../core/base/base.controller';
import { QuestionEntity } from './question-bank.entity';

@ApiTags('Question Bank')
@Controller('question-bank')
export class QuestionBankController extends BaseController<QuestionEntity> {
  constructor(private readonly questionBankService: QuestionBankService) {
    super(questionBankService);
  }

  @Post('bulk')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Import nhiều câu hỏi' })
  bulkImport(@Req() req: any, @Body() dto: BulkImportDto) {
    return this.questionBankService.bulkImport(dto, req.user?.id);
  }

  @Post('ai-generate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI sinh câu hỏi' })
  aiGenerate(@Req() req: any, @Body() dto: AiGenerateQuestionsDto) {
    return this.questionBankService.aiGenerate(dto, req.user?.id);
  }
}
