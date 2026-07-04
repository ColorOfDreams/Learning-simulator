import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notification')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me/page')
  async getMyNotifications(
    @Req() req: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    
    const data = await this.notificationsService.getNotificationsByUser(
      req.user.id,
      pageNum,
      limitNum,
    );

    return data;
  }

  @Post('read')
  async readNotification(
    @Req() req: any,
    @Body() body: { type: 'ALL' | 'ONE'; notificationId?: string },
  ) {
    await this.notificationsService.markAsRead(req.user.id, body.type, body.notificationId);
    
    return true;
  }
}
