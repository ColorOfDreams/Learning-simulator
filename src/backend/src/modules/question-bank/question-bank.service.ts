import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { QuestionEntity, QuestionType } from './question-bank.entity';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QueryQuestionDto,
  AiGenerateQuestionsDto,
  BulkImportDto,
} from './dto/question-bank.dto';
import { LlmService } from '../ai/llm.service';
import { BaseService } from '../../core/base/base.service';

@Injectable()
export class QuestionBankService extends BaseService<QuestionEntity> {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepo: Repository<QuestionEntity>,
    private readonly llmService: LlmService,
  ) {
    super(questionRepo);
  }



  async bulkImport(dto: BulkImportDto, userId?: string): Promise<QuestionEntity[]> {
    const questions = dto.questions.map(q => this.questionRepo.create({ ...q, createdBy: userId }));
    return this.questionRepo.save(questions);
  }

  async getImportHeaders() {
    return [
      { field: 'type', label: 'Loại câu hỏi', required: true, type: 'String' },
      { field: 'subject', label: 'Môn học', required: true, type: 'String' },
      { field: 'grade', label: 'Lớp', required: true, type: 'Number' },
      { field: 'topic', label: 'Chủ đề', required: false, type: 'String' },
      { field: 'chapter', label: 'Chương', required: false, type: 'String' },
      { field: 'question', label: 'Nội dung câu hỏi', required: true, type: 'String' },
      { field: 'options', label: 'Đáp án (JSON)', required: false, type: 'String' },
      { field: 'correctAnswer', label: 'Đáp án đúng', required: true, type: 'String' },
      { field: 'explanation', label: 'Giải thích', required: false, type: 'String' },
      { field: 'difficulty', label: 'Độ khó (1-5)', required: false, type: 'Number' },
      { field: 'tags', label: 'Tags', required: false, type: 'String' },
    ];
  }

  async getImportTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Template');
    
    const headers = (await this.getImportHeaders()).map(h => h.label || h.field);
    ws.addRow(headers);
    
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as any as Buffer;
  }

  async validateImport(rows: any[]) {
    const results = rows.map((row, index) => {
      const errors: string[] = [];
      if (!row.type) errors.push('Thiếu loại câu hỏi');
      else if (![QuestionType.MULTIPLE_CHOICE, QuestionType.ESSAY, QuestionType.SHORT_ANSWER].includes(row.type)) {
        errors.push('Loại câu hỏi không hợp lệ (MULTIPLE_CHOICE, ESSAY, SHORT_ANSWER)');
      }
      if (!row.subject) errors.push('Thiếu môn học');
      if (row.grade === undefined || row.grade === null || row.grade === '') errors.push('Thiếu lớp');
      if (!row.question) errors.push('Thiếu nội dung câu hỏi');
      if (!row.correctAnswer) errors.push('Thiếu đáp án đúng');
      if (row.options && typeof row.options === 'string') {
        try { JSON.parse(row.options); } catch { errors.push('Đáp án (JSON) không đúng định dạng'); }
      }
      return { index, row, rowErrors: errors.length > 0 ? errors : undefined };
    });
    return {
      data: { error: results.some(r => r.rowErrors), validate: results },
    };
  }

  async executeImport(rows: any[], userId?: string) {
    const questions = rows.map(r => {
      let options = r.options;
      if (typeof options === 'string' && options) {
        try { options = JSON.parse(options); } catch { options = undefined; }
      }
      let tags = r.tags;
      if (typeof tags === 'string' && tags) {
        tags = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
      const grade = typeof r.grade === 'string' ? parseInt(r.grade, 10) : r.grade;
      const difficulty = typeof r.difficulty === 'string' ? parseInt(r.difficulty, 10) : (r.difficulty || 2);
      return this.questionRepo.create({
        type: r.type, subject: r.subject, grade, topic: r.topic,
        chapter: r.chapter, question: r.question, options,
        correctAnswer: r.correctAnswer, explanation: r.explanation,
        difficulty, tags, createdBy: userId,
      });
    });
    await this.questionRepo.save(questions);
    return {
      data: {
        error: false,
        validate: questions.map((q, index) => ({ index, row: q, rowErrors: undefined })),
      },
    };
  }

  private normalizeQuestionText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  private async findExistingQuestionTexts(dto: {
    subject: string;
    grade: number;
    topic?: string;
  }): Promise<string[]> {
    const where: Record<string, unknown> = { subject: dto.subject, grade: dto.grade };
    if (dto.topic) where.topic = dto.topic;
    const rows = await this.questionRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 30,
      select: { question: true },
    });
    return rows.map(r => r.question);
  }

  async aiGenerate(dto: AiGenerateQuestionsDto, userId?: string): Promise<QuestionEntity[]> {
    const existingTexts = await this.findExistingQuestionTexts(dto);
    const prompt = this.buildAiPrompt(dto, existingTexts);
    const result = await this.llmService.complete(
      [{ role: 'system', content: 'Bạn là giáo viên giàu kinh nghiệm. Trả lời JSON thuần, không markdown.' },
       { role: 'user', content: prompt }],
      { temperature: 0.7, maxTokens: 4096, responseFormat: 'json_object' },
    );
    if (!result) throw new BadRequestException('AI không phản hồi, vui lòng thử lại');
    const parsed = this.parseAiResponse(result, dto);

    const seen = new Set(existingTexts.map(t => this.normalizeQuestionText(t)));
    const deduped = parsed.filter(q => {
      const norm = this.normalizeQuestionText(q.question || '');
      if (seen.has(norm)) return false;
      seen.add(norm);
      return true;
    });

    const questions = deduped.map(q => this.questionRepo.create({ ...q, createdBy: userId || 'ai' }));
    return this.questionRepo.save(questions);
  }

  private buildAiPrompt(dto: AiGenerateQuestionsDto, existingTexts: string[] = []): string {
    const typeLabels: Record<string, string> = {
      MULTIPLE_CHOICE: 'trắc nghiệm (4 lựa chọn A, B, C, D, chỉ 1 đáp án đúng)',
      ESSAY: 'tự luận (cần trình bày chi tiết lời giải)',
      SHORT_ANSWER: 'câu hỏi ngắn (trả lời ngắn gọn 1-2 dòng)',
    };
    const typeDesc = dto.type ? typeLabels[dto.type] : 'hỗn hợp trắc nghiệm, tự luận và câu hỏi ngắn';
    return JSON.stringify({
      task: `Tạo ${dto.count || 5} câu hỏi ${typeDesc}`,
      subject: dto.subject,
      grade: dto.grade,
      topic: dto.topic || 'tổng hợp',
      difficulty: dto.difficulty || 2,
      outputFormat: {
        questions: [{
          type: 'MULTIPLE_CHOICE | ESSAY | SHORT_ANSWER',
          subject: 'string',
          grade: 'number',
          topic: 'string',
          question: 'string (có thể dùng LaTeX $$...$$)',
          options: [{ key: 'A', text: 'string' }],
          correctAnswer: 'string',
          explanation: 'string',
          difficulty: 'number 1-5',
          tags: ['string'],
        }]
      },
      instruction: 'Trả về object {"questions": [...]}. Với trắc nghiệm phải có options 4 đáp án. Với tự luận và ngắn không cần options.',
      avoidQuestions: existingTexts.length
        ? existingTexts.map(t => t.slice(0, 200))
        : undefined,
      avoidInstruction: existingTexts.length
        ? 'KHÔNG được tạo câu hỏi trùng hoặc rất giống nội dung các câu trong avoidQuestions.'
        : undefined,
    });
  }

  private parseAiResponse(raw: string, dto: AiGenerateQuestionsDto): Partial<QuestionEntity>[] {
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const items = parsed.questions || (Array.isArray(parsed) ? parsed : [parsed]);
      return items.map((item: any) => ({
        type: item.type || dto.type || QuestionType.SHORT_ANSWER,
        subject: item.subject || dto.subject,
        grade: item.grade || dto.grade,
        topic: item.topic || dto.topic,
        question: item.question,
        options: item.options || undefined,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        difficulty: item.difficulty || dto.difficulty || 2,
        tags: item.tags || [],
      }));
    } catch {
      throw new BadRequestException('AI trả về định dạng không hợp lệ, vui lòng thử lại');
    }
  }
}
