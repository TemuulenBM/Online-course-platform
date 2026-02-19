import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';

/**
 * Сургалтын оюутнуудын ахиц жагсаалт авах use case.
 * TEACHER (өөрийн сургалт) болон ADMIN хандах боломжтой.
 */
@Injectable()
export class GetCourseStudentsUseCase {
  private readonly logger = new Logger(GetCourseStudentsUseCase.name);

  constructor(
    private readonly aggregationRepository: AnalyticsAggregationRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(
    courseId: string,
    userId: string,
    userRole: string,
    options: { page: number; limit: number },
  ) {
    /** Эрхийн шалгалт */
    if (userRole !== 'ADMIN') {
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new NotFoundException('Сургалт олдсонгүй');
      }
      if (course.instructorId !== userId) {
        throw new ForbiddenException('Зөвхөн өөрийн сургалтын оюутнуудыг харах боломжтой');
      }
    }

    const result = await this.aggregationRepository.getCourseStudents(courseId, options);

    this.logger.debug(`Сургалтын оюутнууд: ${result.total} олдлоо (course=${courseId})`);

    return result;
  }
}
