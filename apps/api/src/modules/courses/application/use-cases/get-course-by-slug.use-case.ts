import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseEntity } from '../../domain/entities/course.entity';

/**
 * Slug-аар сургалт авах use case.
 * Public endpoint-д зөвхөн PUBLISHED сургалтыг буцаана.
 */
@Injectable()
export class GetCourseBySlugUseCase {
  private readonly logger = new Logger(GetCourseBySlugUseCase.name);

  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(slug: string): Promise<CourseEntity> {
    const course = await this.courseRepository.findBySlug(slug);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    // Зөвхөн PUBLISHED
    if (course.status !== 'published') {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    return course;
  }
}
