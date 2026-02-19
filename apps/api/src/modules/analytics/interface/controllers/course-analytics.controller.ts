import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { GetCourseStatsUseCase } from '../../application/use-cases/get-course-stats.use-case';
import { GetCourseStudentsUseCase } from '../../application/use-cases/get-course-students.use-case';
import { GetCourseLessonsUseCase } from '../../application/use-cases/get-course-lessons.use-case';
import { CourseStudentsQueryDto } from '../../dto/course-students-query.dto';

/**
 * Сургалтын аналитик controller.
 * TEACHER (өөрийн сургалт) болон ADMIN хандах боломжтой.
 */
@ApiTags('Аналитик — Сургалт')
@Controller('analytics/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER', 'ADMIN')
@ApiBearerAuth()
export class CourseAnalyticsController {
  constructor(
    private readonly getCourseStatsUseCase: GetCourseStatsUseCase,
    private readonly getCourseStudentsUseCase: GetCourseStudentsUseCase,
    private readonly getCourseLessonsUseCase: GetCourseLessonsUseCase,
  ) {}

  @Get(':courseId')
  @ApiOperation({ summary: 'Сургалтын дэлгэрэнгүй статистик' })
  @ApiResponse({ status: 200, description: 'Сургалтын тоон үзүүлэлтүүд' })
  async getCourseStats(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.getCourseStatsUseCase.execute(courseId, userId, userRole);
  }

  @Get(':courseId/students')
  @ApiOperation({ summary: 'Сургалтын оюутнуудын ахиц' })
  @ApiResponse({
    status: 200,
    description: 'Оюутнуудын progress жагсаалт pagination-тэй',
  })
  async getCourseStudents(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Query() query: CourseStudentsQueryDto,
  ) {
    return this.getCourseStudentsUseCase.execute(courseId, userId, userRole, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  @Get(':courseId/lessons')
  @ApiOperation({ summary: 'Хичээл тус бүрийн статистик' })
  @ApiResponse({ status: 200, description: 'Хичээлийн completion rate, avg time' })
  async getCourseLessons(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.getCourseLessonsUseCase.execute(courseId, userId, userRole);
  }
}
