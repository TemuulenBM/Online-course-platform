import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { EnrollDto } from '../../dto/enroll.dto';
import { ListEnrollmentsQueryDto } from '../../dto/list-enrollments-query.dto';
import { EnrollUseCase } from '../../application/use-cases/enroll.use-case';
import { ListMyEnrollmentsUseCase } from '../../application/use-cases/list-my-enrollments.use-case';
import { ListCourseEnrollmentsUseCase } from '../../application/use-cases/list-course-enrollments.use-case';
import { CheckEnrollmentUseCase } from '../../application/use-cases/check-enrollment.use-case';
import { GetEnrollmentUseCase } from '../../application/use-cases/get-enrollment.use-case';
import { CancelEnrollmentUseCase } from '../../application/use-cases/cancel-enrollment.use-case';
import { CompleteEnrollmentUseCase } from '../../application/use-cases/complete-enrollment.use-case';
import { DeleteEnrollmentUseCase } from '../../application/use-cases/delete-enrollment.use-case';

/**
 * Элсэлтийн controller.
 * Бүх endpoint JWT шаардлагатай.
 */
@ApiTags('Элсэлтүүд')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentController {
  constructor(
    private readonly enrollUseCase: EnrollUseCase,
    private readonly listMyEnrollmentsUseCase: ListMyEnrollmentsUseCase,
    private readonly listCourseEnrollmentsUseCase: ListCourseEnrollmentsUseCase,
    private readonly checkEnrollmentUseCase: CheckEnrollmentUseCase,
    private readonly getEnrollmentUseCase: GetEnrollmentUseCase,
    private readonly cancelEnrollmentUseCase: CancelEnrollmentUseCase,
    private readonly completeEnrollmentUseCase: CompleteEnrollmentUseCase,
    private readonly deleteEnrollmentUseCase: DeleteEnrollmentUseCase,
  ) {}

  /** Сургалтад элсэх */
  @Post()
  @ApiOperation({ summary: 'Сургалтад элсэх' })
  @ApiResponse({ status: 201, description: 'Амжилттай элслээ' })
  async enroll(
    @CurrentUser('id') userId: string,
    @Body() dto: EnrollDto,
  ) {
    const enrollment = await this.enrollUseCase.execute(userId, dto);
    return enrollment.toResponse();
  }

  /** Миний элсэлтүүдийн жагсаалт */
  @Get('my')
  @ApiOperation({ summary: 'Миний элсэлтүүд' })
  async listMyEnrollments(
    @CurrentUser('id') userId: string,
    @Query() query: ListEnrollmentsQueryDto,
  ) {
    return this.listMyEnrollmentsUseCase.execute(userId, query);
  }

  /** Сургалтын оюутнуудын жагсаалт (Багш, Админ) */
  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Сургалтын оюутнуудын жагсаалт (Багш, Админ)' })
  async listCourseEnrollments(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query() query: ListEnrollmentsQueryDto,
  ) {
    return this.listCourseEnrollmentsUseCase.execute(courseId, userId, role, query);
  }

  /** Элсэлтийн статус шалгах */
  @Get('check/:courseId')
  @ApiOperation({ summary: 'Элсэлтийн статус шалгах' })
  async checkEnrollment(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.checkEnrollmentUseCase.execute(userId, courseId);
  }

  /** Элсэлтийн дэлгэрэнгүй */
  @Get(':id')
  @ApiOperation({ summary: 'Элсэлтийн дэлгэрэнгүй' })
  async getById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const enrollment = await this.getEnrollmentUseCase.execute(id, userId, role);
    return enrollment.toResponse();
  }

  /** Элсэлт цуцлах */
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Элсэлт цуцлах' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const enrollment = await this.cancelEnrollmentUseCase.execute(id, userId, role);
    return enrollment.toResponse();
  }

  /** Элсэлт дуусгах (Зөвхөн Админ) */
  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Элсэлт дуусгах (Зөвхөн Админ)' })
  async complete(@Param('id') id: string) {
    const enrollment = await this.completeEnrollmentUseCase.execute(id);
    return enrollment.toResponse();
  }

  /** Элсэлт устгах (Зөвхөн Админ) */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Элсэлт устгах (Зөвхөн Админ)' })
  async delete(@Param('id') id: string) {
    await this.deleteEnrollmentUseCase.execute(id);
  }
}
