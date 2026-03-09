import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';

/** Stale LIVE session-ууд хэдэн цаг өнгөрсний дараа stale гэж тооцогдох */
const STALE_THRESHOLD_HOURS = 4;

/**
 * Stale LIVE session цэвэрлэх use case.
 * Backend restart эсвэл тогтмол интервалаар ажиллана.
 *
 * 4+ цагийн өмнө эхэлсэн LIVE session-ийг ENDED болгож,
 * Bull Queue-ээр attendee-г markLeft хийнэ.
 */
@Injectable()
export class CleanupStaleLiveSessionsUseCase {
  private readonly logger = new Logger(CleanupStaleLiveSessionsUseCase.name);

  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly liveClassesCacheService: LiveClassesCacheService,
    @InjectQueue('live-classes') private readonly liveClassesQueue: Queue,
  ) {}

  /**
   * Stale LIVE session-уудыг хайж, ENDED болгоно.
   * @returns цэвэрлэсэн session-ийн тоо
   */
  async execute(): Promise<number> {
    const staleSessions =
      await this.liveSessionRepository.findStaleLiveSessions(STALE_THRESHOLD_HOURS);

    if (staleSessions.length === 0) {
      this.logger.log('Stale LIVE session олдсонгүй');
      return 0;
    }

    this.logger.warn(`${staleSessions.length} stale LIVE session олдлоо, цэвэрлэж эхэллээ...`);

    let cleanedCount = 0;

    for (const session of staleSessions) {
      try {
        /** DB шинэчлэх — ENDED */
        await this.liveSessionRepository.update(session.id, {
          status: 'ENDED',
          actualEnd: new Date(),
        });

        /** Кэш invalidate */
        await this.liveClassesCacheService.invalidateSession(session.id, session.lessonId);

        /** Queue — attendee markLeft + notification */
        await this.liveClassesQueue.add('session-ended', {
          sessionId: session.id,
          courseId: session.courseId,
        });

        cleanedCount++;
        this.logger.log(`Stale session цэвэрлэгдлээ: ${session.id} (title: "${session.title}")`);
      } catch (error) {
        this.logger.error(
          `Stale session цэвэрлэхэд алдаа: ${session.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    this.logger.log(`Stale session цэвэрлэгээ дууслаа: ${cleanedCount}/${staleSessions.length}`);
    return cleanedCount;
  }
}
