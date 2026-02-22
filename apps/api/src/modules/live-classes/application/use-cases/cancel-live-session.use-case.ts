import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

/**
 * Session цуцлах use case.
 * Зөвхөн SCHEDULED статустай session-г цуцлах боломжтой.
 */
@Injectable()
export class CancelLiveSessionUseCase {
  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly liveClassesCacheService: LiveClassesCacheService,
  ) {}

  async execute(sessionId: string, userId: string, userRole: string): Promise<LiveSessionEntity> {
    /** 1. Session олдох эсэх */
    const session = await this.liveSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Шууд хичээл олдсонгүй');
    }

    /** 2. Зөвхөн SCHEDULED статустай */
    if (session.status !== 'scheduled') {
      throw new BadRequestException(
        'Зөвхөн товлогдсон (SCHEDULED) шууд хичээлийг цуцлах боломжтой',
      );
    }

    /** 3. Эрхийн шалгалт */
    if (userRole !== 'ADMIN' && session.instructorId !== userId) {
      throw new ForbiddenException('Зөвхөн сургалтын эзэмшигч цуцлах боломжтой');
    }

    /** 4. Статус -> CANCELLED */
    const updated = await this.liveSessionRepository.update(sessionId, {
      status: 'CANCELLED',
    });

    /** 5. Кэш invalidate */
    await this.liveClassesCacheService.invalidateSession(sessionId, session.lessonId);

    return updated;
  }
}
