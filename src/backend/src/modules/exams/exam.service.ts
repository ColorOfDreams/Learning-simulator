import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ExamEntity, ExamSection } from './exam.entity';
import { QuestionEntity } from '../question-bank/question-bank.entity';
import { CreateExamDto, AiGenerateExamDto, QueryExamDto } from './dto/exam.dto';
import { LlmService } from '../ai/llm.service';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(ExamEntity)
    private readonly examRepo: Repository<ExamEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionRepo: Repository<QuestionEntity>,
    private readonly llmService: LlmService,
  ) {}

  async create(dto: CreateExamDto, userId: string): Promise<ExamEntity> {
    let questionCount = 0;
    for (const section of dto.sections) {
      questionCount += section.questions?.length || 0;
    }
    const exam = this.examRepo.create({
      ...dto,
      totalScore: dto.totalScore || 10,
      createdBy: userId,
      isAIGenerated: false,
      questionCount,
      sections: dto.sections as ExamSection[],
    });
    return this.examRepo.save(exam);
  }

  async findAll(query: QueryExamDto): Promise<ExamEntity[]> {
    const where: any = {};
    if (query.subject) where.subject = query.subject;
    if (query.grade) where.grade = query.grade;
    return this.examRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ExamEntity> {
    const exam = await this.examRepo.findOne({ where: { id } });
    if (!exam) throw new NotFoundException('Không tìm thấy đề thi');
    return exam;
  }

  async update(id: string, dto: CreateExamDto, userId: string): Promise<ExamEntity> {
    const exam = await this.findOne(id);
    let questionCount = 0;
    for (const section of dto.sections) {
      questionCount += section.questions?.length || 0;
    }
    Object.assign(exam, {
      ...dto,
      totalScore: dto.totalScore || exam.totalScore,
      questionCount,
      sections: dto.sections as ExamSection[],
    });
    return this.examRepo.save(exam);
  }

  async remove(id: string): Promise<void> {
    const exam = await this.findOne(id);
    await this.examRepo.remove(exam);
  }

  async getExamWithQuestions(id: string): Promise<{ exam: ExamEntity; questions: Record<string, QuestionEntity> }> {
    const exam = await this.findOne(id);
    const questionIds: string[] = [];
    for (const section of exam.sections) {
      for (const q of section.questions || []) {
        questionIds.push(q.questionId);
      }
    }
    const questions = await this.questionRepo.find({ where: { id: In(questionIds) } });
    const questionMap: Record<string, QuestionEntity> = {};
    for (const q of questions) {
      questionMap[q.id] = q;
    }
    return { exam, questions: questionMap };
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

  async aiGenerate(dto: AiGenerateExamDto, userId: string): Promise<ExamEntity> {
    const existingTexts = await this.findExistingQuestionTexts(dto);
    const prompt = this.buildAiExamPrompt(dto, existingTexts);
    const result = await this.llmService.complete(
      [{ role: 'system', content: 'Bạn là giáo viên giàu kinh nghiệm. Trả lời JSON thuần, không markdown.' },
       { role: 'user', content: prompt }],
      { temperature: 0.7, maxTokens: 8192, responseFormat: 'json_object' },
    );
    if (!result) throw new BadRequestException('AI không phản hồi, vui lòng thử lại');
    return this.parseAndSaveAiExam(result, dto, userId, existingTexts);
  }

  private buildAiExamPrompt(dto: AiGenerateExamDto, existingTexts: string[] = []): string {
    const structureDesc = dto.sections?.length
      ? dto.sections.map(s => `${s.count} câu ${this.typeLabel(s.type)} (${s.maxScore} điểm)`).join(', ')
      : 'tự động phân bố hợp lý';
    return JSON.stringify({
      task: `Tạo đề thi môn ${dto.subject} lớp ${dto.grade}`,
      topic: dto.topic || 'tổng hợp',
      difficulty: dto.difficulty || 2,
      duration: dto.duration || 60,
      structure: structureDesc,
      outputFormat: {
        title: `Đề thi ${dto.subject} lớp ${dto.grade}`,
        description: dto.description || '',
        duration: dto.duration || 60,
        totalScore: 10,
        sections: [{
          type: 'MULTIPLE_CHOICE | ESSAY | SHORT_ANSWER',
          title: 'Phần ...',
          maxScore: 'number',
          questions: [{
            type: 'MULTIPLE_CHOICE | ESSAY | SHORT_ANSWER',
            subject: dto.subject,
            grade: dto.grade,
            topic: dto.topic || '',
            question: 'nội dung (có thể LaTeX)',
            options: [{ key: 'A', text: '...' }],
            correctAnswer: 'đáp án',
            explanation: 'giải thích',
            difficulty: 'number 1-5',
            tags: ['string'],
          }],
        }],
      },
      rules: 'Tổng điểm các sections = 10. Mỗi câu MCQ = 0.25đ. Mỗi câu tự luận phân bố điểm theo độ khó. Trả về {title, description, duration, totalScore, sections: [{type, title, maxScore, questions: [...]}]}.',
      avoidQuestions: existingTexts.length
        ? existingTexts.map(t => t.slice(0, 200))
        : undefined,
      avoidInstruction: existingTexts.length
        ? 'KHÔNG được tạo câu hỏi trùng hoặc rất giống nội dung các câu trong avoidQuestions.'
        : undefined,
    });
  }

  private typeLabel(type: string): string {
    const map: Record<string, string> = { MULTIPLE_CHOICE: 'trắc nghiệm', ESSAY: 'tự luận', SHORT_ANSWER: 'câu hỏi ngắn' };
    return map[type] || type;
  }

  private async parseAndSaveAiExam(
    raw: string,
    dto: AiGenerateExamDto,
    userId: string,
    existingTexts: string[] = [],
  ): Promise<ExamEntity> {
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const seen = new Set(existingTexts.map(t => this.normalizeQuestionText(t)));
      let totalSaved = 0;

      const sections: ExamSection[] = [];
      for (const [i, section] of ((parsed.sections || []) as any[]).entries()) {
        const qRefs: { questionId: string; score: number }[] = [];
        for (const qData of section.questions || []) {
          const norm = this.normalizeQuestionText(qData.question || '');
          if (!norm || seen.has(norm)) continue;
          seen.add(norm);

          const qType = qData.type || section.type || 'SHORT_ANSWER';
          const question = this.questionRepo.create({
            type: qType,
            subject: dto.subject,
            grade: dto.grade,
            topic: dto.topic,
            question: qData.question,
            options: qData.options || undefined,
            correctAnswer: qData.correctAnswer,
            explanation: qData.explanation,
            difficulty: qData.difficulty || dto.difficulty || 2,
            tags: qData.tags || [],
            createdBy: 'ai',
          });
          const saved = await this.questionRepo.save(question);
          qRefs.push({ questionId: saved.id, score: 0 });
        }

        const scorePerQ = qRefs.length > 0 ? Math.round((section.maxScore / qRefs.length) * 100) / 100 : 0;
        qRefs.forEach(q => (q.score = scorePerQ));
        totalSaved += qRefs.length;

        sections.push({
          type: section.type,
          title: section.title || `Phần ${i + 1}`,
          maxScore: section.maxScore,
          questions: qRefs,
        });
      }

      const totalScore = sections.reduce((sum, s) => sum + s.maxScore, 0);
      const exam = this.examRepo.create({
        title: parsed.title || `Đề thi ${dto.subject} lớp ${dto.grade}`,
        subject: dto.subject,
        grade: dto.grade,
        description: parsed.description || dto.description,
        duration: parsed.duration || dto.duration || 60,
        totalScore: totalScore || 10,
        createdBy: userId,
        isAIGenerated: true,
        questionCount: totalSaved,
        sections,
      });
      return this.examRepo.save(exam);
    } catch {
      throw new BadRequestException('AI trả về định dạng không hợp lệ, vui lòng thử lại');
    }
  }
}
