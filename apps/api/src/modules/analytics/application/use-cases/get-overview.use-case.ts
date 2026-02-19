import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { AnalyticsCacheService } from '../../infrastructure/services/analytics-cache.service';
import { OverviewStats } from '../../domain/entities/overview-stats.entity';

/**
 * Dashboard overview авах use case.
 * Кэшээс эхлээд, байхгүй бол DB-ээс aggregate хийнэ.
 */
@Injectable()
export class GetOverviewUseCase {
  private readonly logger = new Logger(GetOverviewUseCase.name);

  constructor(
    private readonly aggregationRepository: AnalyticsAggregationRepository,
    private readonly cacheService: AnalyticsCacheService,
  ) {}

  async execute() {
    /** Кэшээс шалгах */
    const cached = await this.cacheService.getOverview<ReturnType<OverviewStats['toResponse']>>();
    if (cached) {
      return cached;
    }

    /** DB-ээс aggregate хийх */
    const overview = await this.aggregationRepository.getOverview();
    const response = overview.toResponse();

    /** Кэшлэх */
    await this.cacheService.setOverview(response);

    this.logger.debug('Dashboard overview тооцоологдлоо');
    return response;
  }
}
