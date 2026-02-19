import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AnalyticsEventRepository } from '../repositories/analytics-event.repository';

/**
 * Analytics Bull Queue processor.
 * Event-ууд async бүртгэх — endpoint хурдан хариу буцаахын тулд.
 */
@Processor('analytics')
export class AnalyticsProcessor {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(private readonly analyticsEventRepository: AnalyticsEventRepository) {}

  /** Event бүртгэх — Bull Queue-ийн track-event process */
  @Process('track-event')
  async handleTrackEvent(
    job: Job<{
      userId?: string | null;
      eventName: string;
      eventCategory: string;
      properties?: Record<string, unknown> | null;
      sessionId?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    }>,
  ): Promise<void> {
    const data = job.data;
    this.logger.debug(`Event бүртгэж байна: ${data.eventName} (${data.eventCategory})`);

    try {
      await this.analyticsEventRepository.create({
        userId: data.userId,
        eventName: data.eventName,
        eventCategory: data.eventCategory,
        properties: data.properties,
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      this.logger.debug(`Event амжилттай бүртгэгдлээ: ${data.eventName}`);
    } catch (error) {
      this.logger.error(
        `Event бүртгэхэд алдаа гарлаа: ${data.eventName}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
