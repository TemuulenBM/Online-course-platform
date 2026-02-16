import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CreateLessonDto } from '../../dto/create-lesson.dto';
import { UpdateLessonDto } from '../../dto/update-lesson.dto';
import { ReorderLessonsDto } from '../../dto/reorder-lessons.dto';
import { ListLessonsQueryDto } from '../../dto/list-lessons-query.dto';
import { LessonResponseDto } from '../../dto/lesson-response.dto';
import { CreateLessonUseCase } from '../../application/use-cases/create-lesson.use-case';
import { GetLessonUseCase } from '../../application/use-cases/get-lesson.use-case';
import { ListLessonsUseCase } from '../../application/use-cases/list-lessons.use-case';
import { UpdateLessonUseCase } from '../../application/use-cases/update-lesson.use-case';
import { TogglePublishLessonUseCase } from '../../application/use-cases/toggle-publish-lesson.use-case';
import { ReorderLessonsUseCase } from '../../application/use-cases/reorder-lessons.use-case';
import { DeleteLessonUseCase } from '../../application/use-cases/delete-lesson.use-case';

/**
 * Хичээлийн controller.
 * Хичээлийн CRUD, нийтлэлт toggle, дараалал өөрчлөх endpoint-уудыг удирдана.
 */
@ApiTags('Хичээлүүд')
@Controller('lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LessonsController {
  constructor(
    private readonly createLessonUseCase: CreateLessonUseCase,
    private readonly getLessonUseCase: GetLessonUseCase,
    private readonly listLessonsUseCase: ListLessonsUseCase,
    private readonly updateLessonUseCase: UpdateLessonUseCase,
    private readonly togglePublishLessonUseCase: TogglePublishLessonUseCase,
    private readonly reorderLessonsUseCase: ReorderLessonsUseCase,
    private readonly deleteLessonUseCase: DeleteLessonUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Шинэ хичээл үүсгэх (Багш, Админ)' })
  @ApiResponse({
    status: 201,
    description: 'Хичээл амжилттай үүсгэгдлээ',
    type: LessonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Сургалт олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreateLessonDto,
  ) {
    const lesson = await this.createLessonUseCase.execute(userId, role, dto);
    return lesson.toResponse();
  }

  @Public()
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Сургалтын хичээлүүдийн жагсаалт' })
  @ApiResponse({
    status: 200,
    description: 'Хичээлүүдийн жагсаалт',
    type: [LessonResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Сургалт олдсонгүй' })
  async listByCourse(
    @Param('courseId') courseId: string,
    @Query() query: ListLessonsQueryDto,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') role?: string,
  ) {
    return this.listLessonsUseCase.execute(courseId, {
      currentUserId: userId,
      currentUserRole: role,
      publishedOnly: query.publishedOnly,
    });
  }

  @Patch('reorder')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Хичээлүүдийн дарааллыг өөрчлөх (Багш, Админ)' })
  @ApiResponse({
    status: 204,
    description: 'Дараалал амжилттай өөрчлөгдлөө',
  })
  @ApiResponse({ status: 404, description: 'Сургалт олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  @ApiResponse({
    status: 400,
    description: 'Зарим хичээл энэ сургалтад хамаарахгүй',
  })
  async reorder(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: ReorderLessonsDto,
  ) {
    await this.reorderLessonsUseCase.execute(userId, role, dto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Хичээлийн дэлгэрэнгүй мэдээлэл' })
  @ApiResponse({
    status: 200,
    description: 'Хичээлийн дэлгэрэнгүй мэдээлэл',
    type: LessonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Хичээл олдсонгүй' })
  async getById(@Param('id') id: string) {
    const lesson = await this.getLessonUseCase.execute(id);
    return lesson.toResponse();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Хичээл шинэчлэх (Эзэмшигч/Админ)' })
  @ApiResponse({
    status: 200,
    description: 'Хичээл амжилттай шинэчлэгдлээ',
    type: LessonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Хичээл олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateLessonDto,
  ) {
    const lesson = await this.updateLessonUseCase.execute(
      id,
      userId,
      role,
      dto,
    );
    return lesson.toResponse();
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Хичээлийн нийтлэлтийг солих (toggle)' })
  @ApiResponse({
    status: 200,
    description: 'Нийтлэлт амжилттай солигдлоо',
    type: LessonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Хичээл олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async togglePublish(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const lesson = await this.togglePublishLessonUseCase.execute(
      id,
      userId,
      role,
    );
    return lesson.toResponse();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Хичээл устгах (Эзэмшигч/Админ)' })
  @ApiResponse({
    status: 204,
    description: 'Хичээл амжилттай устгагдлаа',
  })
  @ApiResponse({ status: 404, description: 'Хичээл олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    await this.deleteLessonUseCase.execute(id, userId, role);
  }
}
