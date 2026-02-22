import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import { UpdateLiveSessionDto } from '../../dto/update-live-session.dto';

/**
 * Session шинэчлэх use case.
 * Зөвхөн SCHEDULED статустай session-г шинэчлэх боломжтой.
 */
@Injectable()
export class UpdateLiveSessionUseCase {
  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly liveClassesCacheService: LiveClassesCacheService,
  ) {}

  async execute(
    sessionId: string,
    userId: string,
    userRole: string,
    dto: UpdateLiveSessionDto,
  ): Promise<LiveSessionEntity> {
    /** 1. Session олдох эсэх */
    const session = await this.liveSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Шууд хичээл олдсонгүй');
    }

    /** 2. Зөвхөн SCHEDULED статустай */
    if (session.status !== 'scheduled') {
      throw new BadRequestException(
        'Зөвхөн товлогдсон (SCHEDULED) шууд хичээлийг шинэчлэх боломжтой',
      );
    }

    /** 3. Эрхийн шалгалт */
    if (userRole !== 'ADMIN' && session.instructorId !== userId) {
      throw new ForbiddenException('Зөвхөн сургалтын эзэмшигч шинэчлэх боломжтой');
    }

    /** 4. Цагийн шалгалт */
    const updateData: Record<string, any> = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;

    const scheduledStart = dto.scheduledStart
      ? new Date(dto.scheduledStart)
      : session.scheduledStart;
    const scheduledEnd = dto.scheduledEnd ? new Date(dto.scheduledEnd) : session.scheduledEnd;

    if (dto.scheduledStart) updateData.scheduledStart = scheduledStart;
    if (dto.scheduledEnd) updateData.scheduledEnd = scheduledEnd;

    if (scheduledStart >= scheduledEnd) {
      throw new BadRequestException('Эхлэх цаг дуусах цагаас өмнө байх ёстой');
    }

    /** 5. Шинэчлэх */
    const updated = await this.liveSessionRepository.update(sessionId, updateData);

    /** 6. Кэш invalidate */
    await this.liveClassesCacheService.invalidateSession(sessionId, session.lessonId);

    return updated;
  }
}
