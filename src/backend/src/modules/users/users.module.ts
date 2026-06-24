import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersSeedService } from './users-seed.service';
import { UserEntity } from './entities/user.entity';
import { UserLabSessionEntity } from './entities/user-lab-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserLabSessionEntity])],
  controllers: [UsersController],
  providers: [UsersService, UsersSeedService],
  exports: [UsersService],
})
export class UsersModule {}
