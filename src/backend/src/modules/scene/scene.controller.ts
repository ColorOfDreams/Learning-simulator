import {
  Controller,
  UseGuards,
  Post,
  Put,
  Delete,
  Get,
  Query,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Like } from 'typeorm';
import { BaseController } from '../../core/base/base.controller';
import {
  PermissionsGuard,
  Permissions,
} from '../../common/guards/permissions.guard';
import { SceneEntity } from './scene.entity';
import { SceneService } from './scene.service';
import type { DeepPartial } from 'typeorm';

@ApiTags('Quản lý thí nghiệm (Sandbox)')
@Controller('scene')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Permissions('quanlythinghiem|xem', 'baihoc|xem')
export class SceneController extends BaseController<SceneEntity> {
  constructor(private readonly sceneService: SceneService) {
    super(sceneService);
  }

  @Get('all')
  async getAll(
    @Query('roomType') roomType?: string,
    @Query('keyword') keyword?: string,
  ) {
    const where: any = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (roomType) where.roomType = roomType;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (keyword) where.name = Like(`%${keyword}%`);
    return this.sceneService.findAll(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      Object.keys(where).length ? { where } : undefined,
    );
  }

  @Get('page')
  async getPage(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('roomType') roomType?: string,
    @Query('keyword') keyword?: string,
  ) {
    const where: any = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (roomType) where.roomType = roomType;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (keyword) where.name = Like(`%${keyword}%`);
    return this.sceneService.findPaginated(
      page,
      limit,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      Object.keys(where).length ? { where } : undefined,
    );
  }

  // ── TAO: POST / PUT / DELETE ──

  @Post()
  @Permissions('quanlythinghiem|tao')
  async create(@Body() createDto: DeepPartial<SceneEntity>) {
    return this.sceneService.create(createDto);
  }

  @Post('import/validate')
  @Permissions('quanlythinghiem|tao')
  async validateImport(@Body('rows') rows: any[]) {
    return this.sceneService.validateImport(rows);
  }

  @Post('import/execute')
  @Permissions('quanlythinghiem|tao')
  async executeImport(@Body('rows') rows: any[]) {
    return this.sceneService.executeImport(rows);
  }

  @Post('export/execute')
  @Permissions('quanlythinghiem|tao')
  async executeExport(@Body() payload: any) {
    return this.sceneService.executeExport(payload);
  }

  @Put('many')
  @Permissions('quanlythinghiem|tao')
  async updateMany(
    @Body('ids') ids: string[],
    @Body('payload') updateDto: DeepPartial<SceneEntity>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.sceneService.updateMany(ids, updateDto);
  }

  @Put(':id')
  @Permissions('quanlythinghiem|tao')
  async update(
    @Param('id') id: string,
    @Body() updateDto: DeepPartial<SceneEntity>,
  ) {
    return this.sceneService.update(id, updateDto);
  }

  @Delete('many')
  @Permissions('quanlythinghiem|tao')
  async deleteMany(@Body('ids') ids: string[]) {
    await this.sceneService.deleteMany(ids);
    return { deletedCount: ids.length };
  }

  @Delete(':id')
  @Permissions('quanlythinghiem|tao')
  async delete(@Param('id') id: string) {
    await this.sceneService.delete(id);
    return true;
  }
}
