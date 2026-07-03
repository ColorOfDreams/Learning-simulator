import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QuestionBankService } from './question-bank.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QueryQuestionDto,
  AiGenerateQuestionsDto,
  BulkImportDto,
} from './dto/question-bank.dto';

@ApiTags('Question Bank')
@Controller('question-bank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo câu hỏi mới' })
  create(@Req() req: any, @Body() dto: CreateQuestionDto) {
    return this.questionBankService.create(dto, req.user?.id);
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

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách câu hỏi (có filter)' })
  findAll(@Query() query: QueryQuestionDto) {
    return this.questionBankService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết câu hỏi' })
  findOne(@Param('id') id: string) {
    return this.questionBankService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật câu hỏi' })
  update(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionBankService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xoá câu hỏi' })
  remove(@Param('id') id: string) {
    return this.questionBankService.remove(id);
  }
}
