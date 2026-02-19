import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { AnalyticsCacheService } from '../../infrastructure/services/analytics-cache.service';

/**
 * Топ сургалтууд авах use case.
 * Элсэлт, дуусгалт, орлогоор эрэмбэлсэн жагсаалт.
 */
@Injectable()
export class GetPopularCoursesUseCase {
  private readonly logger = new Logger(GetPopularCoursesUseCase.name);

  constructor(
    private readonly aggregationRepository: AnalyticsAggregationRepository,
    private readonly cacheService: AnalyticsCacheService,
  ) {}

  async execute(limit: number = 10) {
    /** Кэшээс шалгах */
    const cached = await this.cacheService.getPopularCourses<
      {
        courseId: string;
        courseTitle: string;
        enrollmentCount: number;
        completionCount: number;
        revenue: number;
      }[]
    >(limit);
    if (cached) {
      return cached;
    }

    /** DB-ээс aggregate хийх */
    const items = await this.aggregationRepository.getPopularCourses(limit);
    const response = items.map((item) => item.toResponse());

    /** Кэшлэх */
    await this.cacheService.setPopularCourses(limit, response);

    this.logger.debug(`Топ ${limit} сургалт тооцоологдлоо`);
    return response;
  }
}
