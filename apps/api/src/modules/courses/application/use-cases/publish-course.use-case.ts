import { Injectable, Logger, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CourseEntity } from '../../domain/entities/course.entity';

/**
 * Сургалт нийтлэх use case.
 * Зөвхөн DRAFT статустай сургалтыг PUBLISHED болгоно.
 */
@Injectable()
export class PublishCourseUseCase {
  private readonly logger = new Logger(PublishCourseUseCase.name);

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly courseCacheService: CourseCacheService,
  ) {}

  async execute(
    courseId: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    // Эрхийн шалгалт
    if (course.instructorId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ сургалтыг нийтлэх эрхгүй');
    }

    // Статус шалгалт: зөвхөн DRAFT → PUBLISHED
    if (course.status !== 'draft') {
      throw new ConflictException('Зөвхөн ноорог сургалтыг нийтлэх боломжтой');
    }

    const published = await this.courseRepository.update(courseId, {
      status: 'published',
      publishedAt: new Date(),
    });

    await this.courseCacheService.invalidateCourse(courseId);
    this.logger.log(`Сургалт нийтлэгдлээ: ${courseId}`);
    return published;
  }
}
