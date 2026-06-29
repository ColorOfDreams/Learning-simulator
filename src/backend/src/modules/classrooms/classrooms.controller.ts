import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClassroomsService } from './classrooms.service';
import {
  CreateClassDto,
  JoinClassDto,
  UpdateMemberStatusDto,
  CreateAssignmentDto,
  SubmitAssignmentDto,
} from './dto/classrooms.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Classrooms')
@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo lớp học mới (Giáo viên)' })
  createClass(@Req() req: any, @Body() dto: CreateClassDto) {
    return this.classroomsService.createClass(req.user.id, dto);
  }

  @Get('teacher')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách lớp do giáo viên tạo' })
  getTeacherClasses(@Req() req: any) {
    return this.classroomsService.getTeacherClasses(req.user.id);
  }

  @Get('student/me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách lớp học của học sinh' })
  async getStudentClasses(@Req() req: any) {
    return this.classroomsService.getStudentClasses(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy chi tiết lớp học' })
  getClassById(@Param('id') id: string) {
    return this.classroomsService.getClassById(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa lớp học (chỉ giáo viên tạo lớp)' })
  deleteClass(@Param('id') id: string, @Req() req: any) {
    return this.classroomsService.deleteClass(id, req.user.id);
  }

  @Post('join')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học sinh xin tham gia lớp qua mã mời' })
  joinClass(@Req() req: any, @Body() dto: JoinClassDto) {
    // req.user might be present if they are logged in, otherwise undefined for guests
    const userId = req.user?.id;
    return this.classroomsService.joinClass(userId, dto);
  }

  @Patch(':classId/members/:memberId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Giáo viên duyệt hoặc từ chối học sinh' })
  updateMemberStatus(
    @Param('classId') classId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberStatusDto,
  ) {
    return this.classroomsService.updateMemberStatus(classId, memberId, dto);
  }

  @Post(':classId/assignments')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Giáo viên giao bài tập cho lớp' })
  createAssignment(
    @Param('classId') classId: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.classroomsService.createAssignment(classId, dto);
  }

  @Post('assignments/:assignmentId/submit')
  @ApiOperation({ summary: 'Học sinh nộp bài tập' })
  submitAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.classroomsService.submitAssignment(assignmentId, dto);
  }

}
