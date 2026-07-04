import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyActiveUserEntity } from './entities/daily-active-user.entity';
import { ActivityService } from './activity.service';
import { ActivityTrackingInterceptor } from './activity-tracking.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([DailyActiveUserEntity])],
  providers: [
    ActivityService,
    { provide: APP_INTERCEPTOR, useClass: ActivityTrackingInterceptor },
  ],
  exports: [ActivityService],
})
export class ActivityModule {}
