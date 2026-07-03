import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { QuestionEntity, QuestionType } from './question-bank.entity';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QueryQuestionDto,
  AiGenerateQuestionsDto,
  BulkImportDto,
} from './dto/question-bank.dto';
import { LlmService } from '../ai/llm.service';

@Injectable()
export class QuestionBankService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepo: Repository<QuestionEntity>,
    private readonly llmService: LlmService,
  ) {}

  async create(dto: CreateQuestionDto, userId?: string): Promise<QuestionEntity> {
    const question = this.questionRepo.create({ ...dto, createdBy: userId });
    return this.questionRepo.save(question);
  }

  async findAll(query: QueryQuestionDto): Promise<QuestionEntity[]> {
    const where: any = {};
    if (query.subject) where.subject = query.subject;
    if (query.grade) where.grade = query.grade;
    if (query.type) where.type = query.type;
    if (query.topic) where.topic = query.topic;
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.search) {
      where.question = Like(`%${query.search}%`);
    }
    return this.questionRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<QuestionEntity> {
    const q = await this.questionRepo.findOne({ where: { id } });
    if (!q) throw new NotFoundException('Không tìm thấy câu hỏi');
    return q;
  }

  async update(id: string, dto: UpdateQuestionDto): Promise<QuestionEntity> {
    const q = await this.findOne(id);
    Object.assign(q, dto);
    return this.questionRepo.save(q);
  }

  async remove(id: string): Promise<void> {
    const q = await this.findOne(id);
    await this.questionRepo.remove(q);
  }

  async bulkImport(dto: BulkImportDto, userId?: string): Promise<QuestionEntity[]> {
    const questions = dto.questions.map(q => this.questionRepo.create({ ...q, createdBy: userId }));
    return this.questionRepo.save(questions);
  }

  async aiGenerate(dto: AiGenerateQuestionsDto, userId?: string): Promise<QuestionEntity[]> {
    const prompt = this.buildAiPrompt(dto);
    const result = await this.llmService.complete(
      [{ role: 'system', content: 'Bạn là giáo viên giàu kinh nghiệm. Trả lời JSON thuần, không markdown.' },
       { role: 'user', content: prompt }],
      { temperature: 0.7, maxTokens: 4096, responseFormat: 'json_object' },
    );
    if (!result) throw new BadRequestException('AI không phản hồi, vui lòng thử lại');
    const parsed = this.parseAiResponse(result, dto);
    const questions = parsed.map(q => this.questionRepo.create({ ...q, createdBy: userId || 'ai' }));
    return this.questionRepo.save(questions);
  }

  private buildAiPrompt(dto: AiGenerateQuestionsDto): string {
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
