import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Response } from 'express';

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T> | StreamableFile
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | StreamableFile> {
    return next.handle().pipe(
      map((data: any) => {
        if (Buffer.isBuffer(data)) {
          return new StreamableFile(data);
        }
        const res = context.switchToHttp().getResponse<Response>();
        return { data, message: 'Thành công', statusCode: res.statusCode };
      }),
    );
  }
}
