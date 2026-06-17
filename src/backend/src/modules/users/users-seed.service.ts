import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersSeedService implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
    await this.seedTeacher();
  }

  private async seedAdmin() {
    const existing = await this.usersService.findByEmail('admin@gmail.com');
    if (existing) {
      if (existing.role !== UserRole.ADMIN) {
        await this.usersService.update(existing.id, { role: UserRole.ADMIN });
      }
      return;
    }

    const hashed = await bcrypt.hash('abc123', 10);
    await this.usersService.create({
      email: 'admin@gmail.com',
      password: hashed,
      firstName: 'Admin',
      lastName: 'Hệ thống',
      role: UserRole.ADMIN,
    });
  }

  private async seedTeacher() {
    const existing = await this.usersService.findByEmail('giaovien@gmail.com');
    if (existing) {
      if (existing.role !== UserRole.TEACHER) {
        await this.usersService.update(existing.id, { role: UserRole.TEACHER });
      }
      return;
    }

    const hashed = await bcrypt.hash('abc123', 10);
    await this.usersService.create({
      email: 'giaovien@gmail.com',
      password: hashed,
      firstName: 'Giáo viên',
      lastName: 'Mẫu',
      role: UserRole.TEACHER,
    });
  }
}
