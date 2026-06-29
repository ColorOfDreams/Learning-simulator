import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSessionEntity } from './entities/chat-session.entity';
import { ChatMessageEntity } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSessionEntity)
    private readonly sessionRepo: Repository<ChatSessionEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepo: Repository<ChatMessageEntity>,
  ) {}

  createSession(dto: {
    title?: string;
    subject?: string;
    sceneId?: string;
    userId?: string;
  }) {
    return this.sessionRepo.save(
      this.sessionRepo.create({
        title: dto.title ?? 'Cuộc trò chuyện mới',
        subject: dto.subject ?? 'physics',
        sceneId: dto.sceneId,
        userId: dto.userId,
      }),
    );
  }

  async listSessions(userId?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    return this.sessionRepo.find({
      where,
      order: { updatedAt: 'DESC' },
      take: 20,
    });
  }

  async getSession(sessionId: string) {
    return this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: { messages: true },
    });
  }

  async getMessages(sessionId: string) {
    return this.messageRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
      take: 100,
    });
  }

  addMessage(dto: {
    sessionId: string;
    role: 'user' | 'assistant' | 'guidance';
    content: string;
    metadata?: Record<string, unknown>;
  }) {
    const msg = this.messageRepo.create({
      sessionId: dto.sessionId,
      role: dto.role,
      content: dto.content,
      metadata: dto.metadata,
    });
    return this.messageRepo.save(msg);
  }

  async deleteSession(sessionId: string) {
    await this.sessionRepo.delete(sessionId);
  }

  async deleteAllSessions() {
    await this.messageRepo.createQueryBuilder().delete().execute();
    await this.sessionRepo.createQueryBuilder().delete().execute();
    return { deleted: true };
  }
}
