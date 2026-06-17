import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Body,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'student@example.com' },
        password: { type: 'string', example: 'SecurePass123!' },
        firstName: { type: 'string', example: 'Nguyễn' },
        lastName: { type: 'string', example: 'Văn A' },
        phone: { type: 'string', example: '0912345678' },
      },
      required: ['email', 'password'],
    },
  })
  @HttpCode(201)
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('firstName') firstName?: string,
    @Body('lastName') lastName?: string,
    @Body('phone') phone?: string,
  ) {
    return this.authService.register({
      email,
      password,
      firstName,
      lastName,
      phone,
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập bằng email và mật khẩu' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'student@example.com' },
        password: { type: 'string', example: 'SecurePass123!' },
      },
      required: ['email', 'password'],
    },
  })
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login({ email, password });
  }

  @Post('google/verify')
  @ApiOperation({ summary: 'Xác thực Google Token từ Frontend' })
  @ApiBody({ schema: { properties: { token: { type: 'string' } } } })
  async verifyGoogleToken(@Body('token') token: string) {
    const accessToken = await this.authService.verifyGoogleIdToken(token);
    return { access_token: accessToken };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Khởi tạo đăng nhập bằng Google' })
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback sau khi Google xác thực xong' })
  googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const token = req.user as string;
    return res.redirect(`http://localhost:8000/login/success?token=${token}`);
  }
}
