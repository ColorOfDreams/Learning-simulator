import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

interface GoogleProfile {
  id: string;
  emails: Array<{ value: string }>;
  name?: { givenName?: string; familyName?: string; displayName?: string };
  photos: Array<{ value: string }>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private oauth2Client: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.oauth2Client = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }
  private async fetchScopes(role: string): Promise<string[]> {
    try {
      const baseUrl = this.configService.get<string>('PERMISSION_SERVICE_URL');
      if (!baseUrl) {
        this.logger.warn(
          'PERMISSION_SERVICE_URL chưa được cấu hình, bỏ qua lấy scopes',
        );
        return [];
      }
      const phanHe = this.configService.get<string>('PHAN_HE') || 'ai-mo-phong';
      const res = await fetch(
        `${baseUrl}/phan-quyen/role/${role}/chuc-nang?phanHe=${phanHe}`,
      );
      if (!res.ok) return [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const json = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return json.data?.[0]?.scopes ?? [];
    } catch (err) {
      this.logger.warn(`Không lấy được scopes từ API phân quyền: ${err}`);
      return [];
    }
  }

  async register(dto: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
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

    const scopes = await this.fetchScopes(user.role);
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      scopes,
    };
    return {
      access_token: this.jwtService.sign(jwtPayload),
      user: { id: user.id, email: user.email, role: user.role, scopes },
    };
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

    const scopes = await this.fetchScopes(user.role);
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      scopes,
    };
    return {
      access_token: this.jwtService.sign(jwtPayload),
      user: { id: user.id, email: user.email, role: user.role, scopes },
    };
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
        throw new UnauthorizedException(
          'Google Token does not contain an email',
        );
      }

      const firstName = payload.given_name || payload.name || '';
      const lastName = payload.family_name || '';
      const picture = payload.picture || '';
      const googleId = payload.sub;

      let user = await this.usersService.findByGoogleId(googleId);

      if (!user) {
        user = await this.usersService.findByEmail(email);
        if (user) {
          const updateData: Partial<UserEntity> = { googleId, picture };
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

      const scopes = await this.fetchScopes(user.role);
      const jwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        scopes,
      };
      return this.jwtService.sign(jwtPayload);
    } catch {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async validateOAuthLogin(profile: GoogleProfile): Promise<string> {
    const { id, emails, name, photos } = profile;
    const email = emails[0].value;
    const firstName = name?.givenName || name?.displayName || '';
    const lastName = name?.familyName || '';
    const picture = photos[0].value;

    let user = await this.usersService.findByGoogleId(id);

    if (!user) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        const updateData: Partial<UserEntity> = { googleId: id, picture };
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

    const scopes = await this.fetchScopes(user.role);
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      scopes,
    };
    return this.jwtService.sign(payload);
  }
}
