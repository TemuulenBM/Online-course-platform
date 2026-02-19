import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TrackEventDto } from '../../dto/track-event.dto';

/**
 * Event бүртгэх use case.
 * Bull Queue-д job нэмж async бүртгэнэ — endpoint хурдан хариу буцаана.
 */
@Injectable()
export class TrackEventUseCase {
  private readonly logger = new Logger(TrackEventUseCase.name);

  constructor(
    @InjectQueue('analytics')
    private readonly analyticsQueue: Queue,
  ) {}

  async execute(
    dto: TrackEventDto,
    context: {
      userId?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<{ queued: true }> {
    await this.analyticsQueue.add('track-event', {
      userId: context.userId ?? null,
      eventName: dto.eventName,
      eventCategory: dto.eventCategory,
      properties: dto.properties ?? null,
      sessionId: dto.sessionId ?? null,
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
    });

    this.logger.debug(`Event queue-д нэмэгдлээ: ${dto.eventName} (${dto.eventCategory})`);

    return { queued: true };
  }
}
