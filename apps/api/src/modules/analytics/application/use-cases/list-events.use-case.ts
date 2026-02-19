import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsEventRepository } from '../../infrastructure/repositories/analytics-event.repository';

/**
 * Event жагсаалт авах use case.
 * ADMIN-д зориулсан — pagination + filter.
 */
@Injectable()
export class ListEventsUseCase {
  private readonly logger = new Logger(ListEventsUseCase.name);

  constructor(private readonly analyticsEventRepository: AnalyticsEventRepository) {}

  async execute(options: {
    page: number;
    limit: number;
    eventName?: string;
    eventCategory?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const result = await this.analyticsEventRepository.findMany({
      page: options.page,
      limit: options.limit,
      eventName: options.eventName,
      eventCategory: options.eventCategory,
      userId: options.userId,
      dateFrom: options.dateFrom ? new Date(options.dateFrom) : undefined,
      dateTo: options.dateTo ? new Date(options.dateTo) : undefined,
    });

    this.logger.debug(`Event жагсаалт: ${result.total} олдлоо (page ${result.page})`);

    return {
      data: result.data.map((event) => event.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
