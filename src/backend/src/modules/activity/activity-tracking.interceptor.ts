import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ActivityService } from './activity.service';

@Injectable()
export class ActivityTrackingInterceptor implements NestInterceptor {
  constructor(private readonly activityService: ActivityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const userId = req?.user?.id;
    if (userId) {
      void this.activityService.trackVisit(userId);
    }
    return next.handle();
  }
}
