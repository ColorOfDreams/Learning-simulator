import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { ChatMessageEntity } from './chat-message.entity';

@Entity('chat_sessions')
export class ChatSessionEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, default: 'Cuộc trò chuyện mới' })
  title!: string;

  @Column({ type: 'varchar', length: 50, default: 'physics' })
  subject!: string;

  @Column({ name: 'scene_id', type: 'varchar', nullable: true })
  sceneId?: string;

  @Column({ name: 'user_id', type: 'varchar', nullable: true })
  userId?: string;

  @OneToMany(() => ChatMessageEntity, (msg) => msg.session, { cascade: true })
  messages!: ChatMessageEntity[];
}
