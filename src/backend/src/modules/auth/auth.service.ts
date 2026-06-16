import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private oauth2Client: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.oauth2Client = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
  }

  async register(dto: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName || '',
      lastName: dto.lastName || '',
      phone: dto.phone || undefined,
    });

    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(jwtPayload), user: { id: user.id, email: user.email, role: user.role } };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(jwtPayload), user: { id: user.id, email: user.email, role: user.role } };
  }

  async verifyGoogleIdToken(token: string): Promise<string> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google Token');
      }

      const email = payload.email;
      if (!email) {
        throw new UnauthorizedException('Google Token does not contain an email');
      }

      const firstName = payload.given_name || payload.name || '';
      const lastName = payload.family_name || '';
      const picture = payload.picture || '';
      const googleId = payload.sub;

      let user = await this.usersService.findByGoogleId(googleId);

      if (!user) {
        user = await this.usersService.findByEmail(email);
        if (user) {
          const updateData: any = { googleId, picture };
          if (!user.firstName && firstName) updateData.firstName = firstName;
          if (!user.lastName && lastName) updateData.lastName = lastName;
          await this.usersService.update(user.id, updateData);
        } else {
          user = await this.usersService.create({
            email,
            firstName,
            lastName,
            picture,
            googleId,
          });
        }
      }

      const jwtPayload = { sub: user.id, email: user.email, role: user.role };
      return this.jwtService.sign(jwtPayload);
    } catch (err) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async validateOAuthLogin(profile: any): Promise<string> {
    try {
      const { id, emails, name, photos } = profile;
      const email = emails[0].value;
      const firstName = name.givenName || name.displayName || name || '';
      const lastName = name.familyName || '';
      const picture = photos[0].value;

      let user = await this.usersService.findByGoogleId(id);

      if (!user) {
        user = await this.usersService.findByEmail(email);
        if (user) {
          const updateData: any = { googleId: id, picture };
          if (!user.firstName && firstName) updateData.firstName = firstName;
          if (!user.lastName && lastName) updateData.lastName = lastName;
          await this.usersService.update(user.id, updateData);
        } else {
          user = await this.usersService.create({
            email,
            firstName,
            lastName,
            picture,
            googleId: id,
          });
        }
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      return this.jwtService.sign(payload);
    } catch (err) {
      throw err;
    }
  }
}
