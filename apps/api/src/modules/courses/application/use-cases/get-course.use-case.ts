import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CourseEntity } from '../../domain/entities/course.entity';

/**
 * Сургалт авах use case (ID-аар).
 * Public endpoint-д зөвхөн PUBLISHED сургалтыг буцаана.
 */
@Injectable()
export class GetCourseUseCase {
  private readonly logger = new Logger(GetCourseUseCase.name);

  constructor(private readonly courseCacheService: CourseCacheService) {}

  async execute(courseId: string, publishedOnly: boolean = true): Promise<CourseEntity> {
    const course = await this.courseCacheService.getCourse(courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    // Public хандалтад зөвхөн PUBLISHED
    if (publishedOnly && course.status !== 'published') {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    return course;
  }
}
