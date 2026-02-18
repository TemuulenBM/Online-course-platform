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
import { UpdateProgressDto } from '../../dto/update-progress.dto';
import { UpdateVideoPositionDto } from '../../dto/update-video-position.dto';
import { ListEnrollmentsQueryDto } from '../../../enrollments/dto/list-enrollments-query.dto';
import { UpdateLessonProgressUseCase } from '../../application/use-cases/update-lesson-progress.use-case';
import { CompleteLessonUseCase } from '../../application/use-cases/complete-lesson.use-case';
import { GetLessonProgressUseCase } from '../../application/use-cases/get-lesson-progress.use-case';
import { GetCourseProgressUseCase } from '../../application/use-cases/get-course-progress.use-case';
import { ListMyProgressUseCase } from '../../application/use-cases/list-my-progress.use-case';
import { UpdateVideoPositionUseCase } from '../../application/use-cases/update-video-position.use-case';
import { DeleteProgressUseCase } from '../../application/use-cases/delete-progress.use-case';

/**
 * Ахицын controller.
 * Бүх endpoint JWT шаардлагатай.
 */
@ApiTags('Ахиц')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(
    private readonly updateLessonProgressUseCase: UpdateLessonProgressUseCase,
    private readonly completeLessonUseCase: CompleteLessonUseCase,
    private readonly getLessonProgressUseCase: GetLessonProgressUseCase,
    private readonly getCourseProgressUseCase: GetCourseProgressUseCase,
    private readonly listMyProgressUseCase: ListMyProgressUseCase,
    private readonly updateVideoPositionUseCase: UpdateVideoPositionUseCase,
    private readonly deleteProgressUseCase: DeleteProgressUseCase,
  ) {}

  /** Миний бүх ахицын жагсаалт */
  @Get('my')
  @ApiOperation({ summary: 'Миний ахицуудын жагсаалт' })
  @ApiResponse({ status: 200, description: 'Ахицуудын жагсаалт' })
  async listMyProgress(@CurrentUser('id') userId: string, @Query() query: ListEnrollmentsQueryDto) {
    return this.listMyProgressUseCase.execute(userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  /** Сургалтын ахицын нэгтгэл */
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Сургалтын ахицын нэгтгэл' })
  @ApiResponse({ status: 200, description: 'Сургалтын ахицын хураангуй' })
  async getCourseProgress(@CurrentUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.getCourseProgressUseCase.execute(userId, courseId);
  }

  /** Хичээлийн ахиц авах */
  @Get('lessons/:lessonId')
  @ApiOperation({ summary: 'Хичээлийн ахиц авах' })
  @ApiResponse({ status: 200, description: 'Хичээлийн ахицын мэдээлэл' })
  async getLessonProgress(@CurrentUser('id') userId: string, @Param('lessonId') lessonId: string) {
    return this.getLessonProgressUseCase.execute(userId, lessonId);
  }

  /** Хичээлийн ахиц шинэчлэх */
  @Post('lessons/:lessonId')
  @ApiOperation({ summary: 'Хичээлийн ахиц шинэчлэх' })
  @ApiResponse({ status: 200, description: 'Ахиц амжилттай шинэчлэгдлээ' })
  async updateLessonProgress(
    @CurrentUser('id') userId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    const progress = await this.updateLessonProgressUseCase.execute(userId, lessonId, dto);
    return progress.toResponse();
  }

  /** Хичээл дуусгах */
  @Post('lessons/:lessonId/complete')
  @ApiOperation({ summary: 'Хичээл дуусгах' })
  @ApiResponse({ status: 200, description: 'Хичээл амжилттай дууслаа' })
  async completeLesson(@CurrentUser('id') userId: string, @Param('lessonId') lessonId: string) {
    const result = await this.completeLessonUseCase.execute(userId, lessonId);
    return {
      ...result.progress.toResponse(),
      courseCompleted: result.courseCompleted,
    };
  }

  /** Видеоны байрлал шинэчлэх */
  @Patch('lessons/:lessonId/position')
  @ApiOperation({ summary: 'Видеоны байрлал шинэчлэх' })
  @ApiResponse({
    status: 200,
    description: 'Видеоны байрлал амжилттай шинэчлэгдлээ',
  })
  async updateVideoPosition(
    @CurrentUser('id') userId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateVideoPositionDto,
  ) {
    const progress = await this.updateVideoPositionUseCase.execute(userId, lessonId, dto);
    return progress.toResponse();
  }

  /** Ахиц устгах (Зөвхөн Админ) */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ахиц устгах (Зөвхөн Админ)' })
  @ApiResponse({ status: 204, description: 'Ахиц амжилттай устгагдлаа' })
  async deleteProgress(@Param('id') id: string) {
    await this.deleteProgressUseCase.execute(id);
  }
}
