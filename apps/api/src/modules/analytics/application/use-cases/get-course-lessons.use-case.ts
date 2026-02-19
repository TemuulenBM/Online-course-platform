import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';

/**
 * Хичээл тус бүрийн статистик авах use case.
 * TEACHER (өөрийн сургалт) болон ADMIN хандах боломжтой.
 */
@Injectable()
export class GetCourseLessonsUseCase {
  private readonly logger = new Logger(GetCourseLessonsUseCase.name);

  constructor(
    private readonly aggregationRepository: AnalyticsAggregationRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(courseId: string, userId: string, userRole: string) {
    /** Эрхийн шалгалт */
    if (userRole !== 'ADMIN') {
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new NotFoundException('Сургалт олдсонгүй');
      }
      if (course.instructorId !== userId) {
        throw new ForbiddenException('Зөвхөн өөрийн сургалтын хичээлийн статистик харах боломжтой');
      }
    }

    const lessons = await this.aggregationRepository.getCourseLessonStats(courseId);

    this.logger.debug(`Хичээлийн статистик: ${lessons.length} хичээл (course=${courseId})`);

    return lessons.map((lesson) => lesson.toResponse());
  }
}
