import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CourseEntity } from '../../domain/entities/course.entity';

/**
 * Сургалт архивлах use case.
 * Зөвхөн PUBLISHED статустай сургалтыг ARCHIVED болгоно.
 */
@Injectable()
export class ArchiveCourseUseCase {
  private readonly logger = new Logger(ArchiveCourseUseCase.name);

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
      throw new ForbiddenException('Энэ сургалтыг архивлах эрхгүй');
    }

    // Статус шалгалт: зөвхөн PUBLISHED → ARCHIVED
    if (course.status !== 'published') {
      throw new ConflictException('Зөвхөн нийтлэгдсэн сургалтыг архивлах боломжтой');
    }

    const archived = await this.courseRepository.update(courseId, {
      status: 'archived',
    });

    await this.courseCacheService.invalidateCourse(courseId);
    this.logger.log(`Сургалт архивлагдлаа: ${courseId}`);
    return archived;
  }
}
