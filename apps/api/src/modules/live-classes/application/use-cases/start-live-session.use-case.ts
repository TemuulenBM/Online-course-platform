import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { IAgoraService, AGORA_SERVICE } from '../../domain/interfaces/agora-service.interface';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

/**
 * Session эхлүүлэх use case.
 * SCHEDULED → LIVE. Agora channel үүсгэж, токен буцаана.
 */
@Injectable()
export class StartLiveSessionUseCase {
  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly liveClassesCacheService: LiveClassesCacheService,
    @Inject(AGORA_SERVICE) private readonly agoraService: IAgoraService,
    @InjectQueue('live-classes') private readonly liveClassesQueue: Queue,
  ) {}

  async execute(
    sessionId: string,
    userId: string,
  ): Promise<{
    session: LiveSessionEntity;
    token: string;
    channelName: string;
  }> {
    /** 1. Session олдох */
    const session = await this.liveSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Шууд хичээл олдсонгүй');
    }

    /** 2. Зөвхөн SCHEDULED статустай */
    if (session.status !== 'scheduled') {
      throw new BadRequestException(
        'Зөвхөн товлогдсон (SCHEDULED) шууд хичээлийг эхлүүлэх боломжтой',
      );
    }

    /** 3. Зөвхөн instructor */
    if (session.instructorId !== userId) {
      throw new ForbiddenException('Зөвхөн шууд хичээлийн багш эхлүүлэх боломжтой');
    }

    /** 4. Agora channel + token */
    const channelName = this.agoraService.generateChannelName(sessionId);
    const token = this.agoraService.generateRtcToken(channelName, 0, 'publisher');

    /** 5. DB шинэчлэх — LIVE */
    const updated = await this.liveSessionRepository.update(sessionId, {
      status: 'LIVE',
      actualStart: new Date(),
      meetingId: channelName,
      meetingUrl: channelName,
    });

    /** 6. Кэш invalidate */
    await this.liveClassesCacheService.invalidateSession(sessionId, session.lessonId);

    /** 7. Notification queue job */
    await this.liveClassesQueue.add('session-started', {
      sessionId: session.id,
      courseId: session.courseId,
    });

    return { session: updated, token, channelName };
  }
}
