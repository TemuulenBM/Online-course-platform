import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

/**
 * Session дуусгах use case.
 * LIVE → ENDED. Bull Queue-ээр attendee-г markLeft, notification.
 */
@Injectable()
export class EndLiveSessionUseCase {
  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly liveClassesCacheService: LiveClassesCacheService,
    @InjectQueue('live-classes') private readonly liveClassesQueue: Queue,
  ) {}

  async execute(sessionId: string, userId: string): Promise<LiveSessionEntity> {
    /** 1. Session олдох */
    const session = await this.liveSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Шууд хичээл олдсонгүй');
    }

    /** 2. Зөвхөн LIVE статустай */
    if (session.status !== 'live') {
      throw new BadRequestException('Зөвхөн идэвхтэй (LIVE) шууд хичээлийг дуусгах боломжтой');
    }

    /** 3. Зөвхөн instructor */
    if (session.instructorId !== userId) {
      throw new ForbiddenException('Зөвхөн шууд хичээлийн багш дуусгах боломжтой');
    }

    /** 4. DB шинэчлэх — ENDED */
    const updated = await this.liveSessionRepository.update(sessionId, {
      status: 'ENDED',
      actualEnd: new Date(),
    });

    /** 5. Кэш invalidate */
    await this.liveClassesCacheService.invalidateSession(sessionId, session.lessonId);

    /** 6. Queue — attendee markLeft + notification */
    await this.liveClassesQueue.add('session-ended', {
      sessionId: session.id,
      courseId: session.courseId,
    });

    return updated;
  }
}
