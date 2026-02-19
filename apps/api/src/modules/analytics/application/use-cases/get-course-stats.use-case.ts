import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { AnalyticsCacheService } from '../../infrastructure/services/analytics-cache.service';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { CourseStats } from '../../domain/entities/course-stats.entity';

/**
 * Сургалтын статистик авах use case.
 * TEACHER (өөрийн сургалт) болон ADMIN хандах боломжтой.
 */
@Injectable()
export class GetCourseStatsUseCase {
  private readonly logger = new Logger(GetCourseStatsUseCase.name);

  constructor(
    private readonly aggregationRepository: AnalyticsAggregationRepository,
    private readonly cacheService: AnalyticsCacheService,
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(courseId: string, userId: string, userRole: string) {
    /** Эрхийн шалгалт: ADMIN бүгдийг, TEACHER зөвхөн өөрийнхийг */
    if (userRole !== 'ADMIN') {
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new NotFoundException('Сургалт олдсонгүй');
      }
      if (course.instructorId !== userId) {
        throw new ForbiddenException('Зөвхөн өөрийн сургалтын статистик харах боломжтой');
      }
    }

    /** Кэшээс шалгах */
    const cached =
      await this.cacheService.getCourseStats<ReturnType<CourseStats['toResponse']>>(courseId);
    if (cached) {
      return cached;
    }

    /** DB-ээс aggregate хийх */
    const stats = await this.aggregationRepository.getCourseStats(courseId);
    if (!stats) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    const response = stats.toResponse();

    /** Кэшлэх */
    await this.cacheService.setCourseStats(courseId, response);

    this.logger.debug(`Сургалтын статистик тооцоологдлоо: ${courseId}`);
    return response;
  }
}
