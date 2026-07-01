import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(
    userId: string,
    title: string,
    content: string,
    type: string,
    metadata?: any,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      title,
      content,
      type,
      metadata,
    });
    return this.notificationRepository.save(notification);
  }

  async getNotificationsByUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const [result, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const unread = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    // Map _id for frontend compatibility
    const mappedResult = result.map(n => ({
      ...n,
      _id: n.id,
      read: n.isRead,
    }));

    return {
      result: mappedResult,
      total,
      unread,
    };
  }

  async markAsRead(userId: string, type: 'ALL' | 'ONE', notificationId?: string) {
    if (type === 'ALL') {
      await this.notificationRepository.update(
        { userId, isRead: false },
        { isRead: true },
      );
    } else if (type === 'ONE' && notificationId) {
      await this.notificationRepository.update(
        { id: notificationId, userId },
        { isRead: true },
      );
    }
    return true;
  }
}
