import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CourseEntity } from '../../domain/entities/course.entity';
import { UpdateCourseDto } from '../../dto/update-course.dto';
import { generateSlug, generateUniqueSlug } from '../../../../common/utils/slug.util';

/**
 * Сургалт шинэчлэх use case.
 * Зөвхөн эзэмшигч багш эсвэл админ шинэчилж чадна.
 */
@Injectable()
export class UpdateCourseUseCase {
  private readonly logger = new Logger(UpdateCourseUseCase.name);

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly courseCacheService: CourseCacheService,
  ) {}

  async execute(
    courseId: string,
    currentUserId: string,
    currentUserRole: string,
    dto: UpdateCourseDto,
  ): Promise<CourseEntity> {
    // Сургалт олох
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    // Эрхийн шалгалт: эзэмшигч эсвэл admin
    if (course.instructorId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ сургалтыг засах эрхгүй');
    }

    // Ангилал шинэчлэгдсэн бол шалгах
    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) {
        throw new NotFoundException('Ангилал олдсонгүй');
      }
    }

    // Title өөрчлөгдсөн бол slug дахин үүсгэх
    let newSlug: string | undefined;
    if (dto.title && dto.title !== course.title) {
      const baseSlug = generateSlug(dto.title);
      newSlug = await generateUniqueSlug(baseSlug, (s) => this.courseRepository.slugExists(s));
    }

    // Шинэчлэх
    const updated = await this.courseRepository.update(courseId, {
      ...dto,
      slug: newSlug,
    });

    // Tags шинэчлэх (хэрэв илгээсэн бол)
    if (dto.tags) {
      await this.courseRepository.updateTags(courseId, dto.tags);
    }

    // Кэш invalidate
    await this.courseCacheService.invalidateCourse(courseId);

    this.logger.log(`Сургалт шинэчлэгдлээ: ${courseId}`);
    return updated;
  }
}
