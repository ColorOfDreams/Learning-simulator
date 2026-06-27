import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { ChatSessionEntity } from './chat-session.entity';

@Entity('chat_messages')
export class ChatMessageEntity extends BaseEntity {
  @Column({ name: 'session_id', type: 'uuid' })
  sessionId!: string;

  @Column({ type: 'varchar', length: 20 })
  role!: 'user' | 'assistant' | 'guidance';

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToOne(() => ChatSessionEntity, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: ChatSessionEntity;
}
