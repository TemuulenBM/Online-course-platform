import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { AnalyticsCacheService } from '../../infrastructure/services/analytics-cache.service';
import { RevenueReport } from '../../domain/entities/revenue-report.entity';

/**
 * Орлогын тайлан авах use case.
 * Хугацааны бүлэглэлтэй (өдөр/сар/жил) орлогын мэдээлэл.
 */
@Injectable()
export class GetRevenueReportUseCase {
  private readonly logger = new Logger(GetRevenueReportUseCase.name);

  constructor(
    private readonly aggregationRepository: AnalyticsAggregationRepository,
    private readonly cacheService: AnalyticsCacheService,
  ) {}

  async execute(options: { period: 'day' | 'month' | 'year'; dateFrom?: string; dateTo?: string }) {
    /** Default: сүүлийн 12 сар */
    const now = new Date();
    const dateFrom = options.dateFrom
      ? new Date(options.dateFrom)
      : new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const dateTo = options.dateTo ? new Date(options.dateTo) : now;
    const dateFromStr = dateFrom.toISOString().split('T')[0];
    const dateToStr = dateTo.toISOString().split('T')[0];

    /** Кэшээс шалгах */
    const cached = await this.cacheService.getRevenue<ReturnType<RevenueReport['toResponse']>>(
      options.period,
      dateFromStr,
      dateToStr,
    );
    if (cached) {
      return cached;
    }

    /** DB-ээс aggregate хийх */
    const report = await this.aggregationRepository.getRevenueReport(
      options.period,
      dateFrom,
      dateTo,
    );
    const response = report.toResponse();

    /** Кэшлэх */
    await this.cacheService.setRevenue(options.period, dateFromStr, dateToStr, response);

    this.logger.debug(
      `Орлогын тайлан тооцоологдлоо: ${options.period} (${dateFromStr} — ${dateToStr})`,
    );
    return response;
  }
}
