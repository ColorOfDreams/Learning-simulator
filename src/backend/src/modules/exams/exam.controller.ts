import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ExamService } from './exam.service';
import { CreateExamDto, AiGenerateExamDto, QueryExamDto } from './dto/exam.dto';

@ApiTags('Exams')
@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo đề thi thủ công' })
  create(@Req() req: any, @Body() dto: CreateExamDto) {
    return this.examService.create(dto, req.user.id);
  }

  @Post('ai-generate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI tạo đề thi' })
  aiGenerate(@Req() req: any, @Body() dto: AiGenerateExamDto) {
    return this.examService.aiGenerate(dto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách đề thi' })
  findAll(@Query() query: QueryExamDto) {
    return this.examService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết đề thi' })
  findOne(@Param('id') id: string) {
    return this.examService.findOne(id);
  }

  @Get(':id/questions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đề thi kèm câu hỏi chi tiết' })
  getWithQuestions(@Param('id') id: string) {
    return this.examService.getExamWithQuestions(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật đề thi' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: CreateExamDto) {
    return this.examService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xoá đề thi' })
  remove(@Param('id') id: string) {
    return this.examService.remove(id);
  }
}
