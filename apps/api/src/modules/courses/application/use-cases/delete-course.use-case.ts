import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';

/**
 * Сургалт устгах use case.
 * Зөвхөн админ устгаж чадна.
 */
@Injectable()
export class DeleteCourseUseCase {
  private readonly logger = new Logger(DeleteCourseUseCase.name);

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly courseCacheService: CourseCacheService,
  ) {}

  async execute(courseId: string): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    await this.courseRepository.delete(courseId);
    await this.courseCacheService.invalidateCourse(courseId);

    this.logger.log(`Сургалт устгагдлаа: ${courseId} (${course.title})`);
  }
}
