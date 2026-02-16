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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CreateCourseDto } from '../../dto/create-course.dto';
import { UpdateCourseDto } from '../../dto/update-course.dto';
import { ListCoursesQueryDto } from '../../dto/list-courses-query.dto';
import { CourseResponseDto } from '../../dto/course-response.dto';
import { CreateCourseUseCase } from '../../application/use-cases/create-course.use-case';
import { GetCourseUseCase } from '../../application/use-cases/get-course.use-case';
import { GetCourseBySlugUseCase } from '../../application/use-cases/get-course-by-slug.use-case';
import { UpdateCourseUseCase } from '../../application/use-cases/update-course.use-case';
import { PublishCourseUseCase } from '../../application/use-cases/publish-course.use-case';
import { ArchiveCourseUseCase } from '../../application/use-cases/archive-course.use-case';
import { ListCoursesUseCase } from '../../application/use-cases/list-courses.use-case';
import { ListMyCoursesUseCase } from '../../application/use-cases/list-my-courses.use-case';
import { DeleteCourseUseCase } from '../../application/use-cases/delete-course.use-case';

/**
 * Сургалтын controller.
 * Сургалтын CRUD, нийтлэх, архивлах, жагсаалт зэрэг endpoint-уудыг удирдана.
 */
@ApiTags('Сургалтууд')
@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly getCourseUseCase: GetCourseUseCase,
    private readonly getCourseBySlugUseCase: GetCourseBySlugUseCase,
    private readonly updateCourseUseCase: UpdateCourseUseCase,
    private readonly publishCourseUseCase: PublishCourseUseCase,
    private readonly archiveCourseUseCase: ArchiveCourseUseCase,
    private readonly listCoursesUseCase: ListCoursesUseCase,
    private readonly listMyCoursesUseCase: ListMyCoursesUseCase,
    private readonly deleteCourseUseCase: DeleteCourseUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Шинэ сургалт үүсгэх (Багш, Админ)' })
  @ApiResponse({ status: 201, description: 'Сургалт амжилттай үүсгэгдлээ', type: CourseResponseDto })
  @ApiResponse({ status: 404, description: 'Ангилал олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCourseDto,
  ) {
    const course = await this.createCourseUseCase.execute(userId, dto);
    return course.toResponse();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Сургалтуудын жагсаалт' })
  @ApiResponse({ status: 200, description: 'Сургалтуудын жагсаалт pagination-тэй' })
  async list(@Query() query: ListCoursesQueryDto) {
    return this.listCoursesUseCase.execute(query);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Миний сургалтууд (Багш)' })
  @ApiResponse({ status: 200, description: 'Багшийн сургалтуудын жагсаалт' })
  async listMyCourses(
    @CurrentUser('id') userId: string,
    @Query() query: ListCoursesQueryDto,
  ) {
    return this.listMyCoursesUseCase.execute(userId, query);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Slug-аар сургалт авах' })
  @ApiResponse({ status: 200, description: 'Сургалтын дэлгэрэнгүй мэдээлэл', type: CourseResponseDto })
  @ApiResponse({ status: 404, description: 'Сургалт олдсонгүй' })
  async getBySlug(@Param('slug') slug: string) {
    const course = await this.getCourseBySlugUseCase.execute(slug);
    return course.toResponse();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Сургалтын дэлгэрэнгүй мэдээлэл' })
  @ApiResponse({ status: 200, description: 'Сургалтын дэлгэрэнгүй мэдээлэл', type: CourseResponseDto })
  @ApiResponse({ status: 404, description: 'Сургалт олдсонгүй' })
  async getById(@Param('id') id: string) {
    const course = await this.getCourseUseCase.execute(id);
    return course.toResponse();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Сургалт шинэчлэх (Эзэмшигч/Админ)' })
  @ApiResponse({ status: 200, description: 'Сургалт амжилттай шинэчлэгдлээ', type: CourseResponseDto })
  @ApiResponse({ status: 404, description: 'Сургалт олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateCourseDto,
  ) {
    const course = await this.updateCourseUseCase.execute(id, userId, role, dto);
    return course.toResponse();
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Сургалт нийтлэх (DRAFT→PUBLISHED)' })
  @ApiResponse({ status: 200, description: 'Сургалт амжилттай нийтлэгдлээ', type: CourseResponseDto })
  @ApiResponse({ status: 404, description: 'Сургалт олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  @ApiResponse({ status: 409, description: 'Зөвхөн ноорог сургалтыг нийтлэх боломжтой' })
  async publish(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const course = await this.publishCourseUseCase.execute(id, userId, role);
    return course.toResponse();
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Сургалт архивлах (PUBLISHED→ARCHIVED)' })
  @ApiResponse({ status: 200, description: 'Сургалт амжилттай архивлагдлаа', type: CourseResponseDto })
  @ApiResponse({ status: 404, description: 'Сургалт олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  @ApiResponse({ status: 409, description: 'Зөвхөн нийтлэгдсэн сургалтыг архивлах боломжтой' })
  async archive(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const course = await this.archiveCourseUseCase.execute(id, userId, role);
    return course.toResponse();
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Сургалт устгах (Зөвхөн Админ)' })
  @ApiResponse({ status: 204, description: 'Сургалт амжилттай устгагдлаа' })
  @ApiResponse({ status: 404, description: 'Сургалт олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async delete(@Param('id') id: string) {
    await this.deleteCourseUseCase.execute(id);
  }
}
