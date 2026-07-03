const fs = require('fs');
const path = require('path');

const modules = [
  { dir: 'subjects', entityClass: 'Subject', name: 'subject', table: 'subjects', route: 'subjects' },
  { dir: 'grades', entityClass: 'Grade', name: 'grade', table: 'grades', route: 'grades' },
  { dir: 'question-types', entityClass: 'QuestionType', name: 'question-type', table: 'question_types', route: 'question-types' },
  { dir: 'difficulties', entityClass: 'Difficulty', name: 'difficulty', table: 'difficulties', route: 'difficulties' },
];

const basePath = path.join(__dirname, 'src', 'modules');

modules.forEach(m => {
  const modPath = path.join(basePath, m.dir);
  fs.mkdirSync(modPath, { recursive: true });

  const entityCode = `import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('${m.table}')
export class ${m.entityClass} extends BaseEntity {
  @ApiProperty({ description: 'Tên ${m.name}' })
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Mã ${m.name}' })
  @Column({ name: 'code', type: 'varchar', length: 100 })
  code!: string;

  @ApiProperty({ description: 'Mô tả thêm', required: false })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;
}
`;
  fs.writeFileSync(path.join(modPath, `${m.name}.entity.ts`), entityCode);

  const serviceCode = `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${m.entityClass} } from './${m.name}.entity';
import { BaseService } from '../../core/base/base.service';

@Injectable()
export class ${m.entityClass}sService extends BaseService<${m.entityClass}> {
  constructor(
    @InjectRepository(${m.entityClass})
    protected readonly repo: Repository<${m.entityClass}>,
  ) {
    super(repo);
  }
}
`;
  fs.writeFileSync(path.join(modPath, `${m.dir.replace('-', '_')}.service.ts`), serviceCode);

  const controllerCode = `import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${m.entityClass} } from './${m.name}.entity';
import { ${m.entityClass}sService } from './${m.dir.replace('-', '_')}.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('${m.route}')
@Controller('${m.route}')
export class ${m.entityClass}sController extends BaseController<${m.entityClass}> {
  constructor(private readonly service: ${m.entityClass}sService) {
    super(service);
  }
}
`;
  fs.writeFileSync(path.join(modPath, `${m.dir.replace('-', '_')}.controller.ts`), controllerCode);

  const moduleCode = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${m.entityClass} } from './${m.name}.entity';
import { ${m.entityClass}sController } from './${m.dir.replace('-', '_')}.controller';
import { ${m.entityClass}sService } from './${m.dir.replace('-', '_')}.service';

@Module({
  imports: [TypeOrmModule.forFeature([${m.entityClass}])],
  controllers: [${m.entityClass}sController],
  providers: [${m.entityClass}sService],
  exports: [${m.entityClass}sService],
})
export class ${m.entityClass}sModule {}
`;
  fs.writeFileSync(path.join(modPath, `${m.dir.replace('-', '_')}.module.ts`), moduleCode);
});

// Topics is special
const tPath = path.join(basePath, 'topics');
fs.mkdirSync(tPath, { recursive: true });

const topicEntityCode = `import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('topics')
export class Topic extends BaseEntity {
  @ApiProperty({ description: 'Tên chủ đề' })
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Mã chủ đề' })
  @Column({ name: 'code', type: 'varchar', length: 100 })
  code!: string;

  @ApiProperty({ description: 'Mô tả thêm', required: false })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Mã môn học', required: false })
  @Column({ name: 'subject_code', type: 'varchar', length: 100, nullable: true })
  subjectCode?: string;

  @ApiProperty({ description: 'Mã lớp', required: false })
  @Column({ name: 'grade_code', type: 'varchar', length: 100, nullable: true })
  gradeCode?: string;
}
`;
fs.writeFileSync(path.join(tPath, 'topic.entity.ts'), topicEntityCode);

const topicServiceCode = `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './topic.entity';
import { BaseService } from '../../core/base/base.service';

@Injectable()
export class TopicsService extends BaseService<Topic> {
  constructor(
    @InjectRepository(Topic)
    protected readonly repo: Repository<Topic>,
  ) {
    super(repo);
  }
}
`;
fs.writeFileSync(path.join(tPath, 'topics.service.ts'), topicServiceCode);

const topicControllerCode = `import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Topic } from './topic.entity';
import { TopicsService } from './topics.service';
import { BaseController } from '../../core/base/base.controller';

@ApiTags('topics')
@Controller('topics')
export class TopicsController extends BaseController<Topic> {
  constructor(private readonly service: TopicsService) {
    super(service);
  }
}
`;
fs.writeFileSync(path.join(tPath, 'topics.controller.ts'), topicControllerCode);

const topicModuleCode = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './topic.entity';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Topic])],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}
`;
fs.writeFileSync(path.join(tPath, 'topics.module.ts'), topicModuleCode);

console.log('Done generating backend modules!');
