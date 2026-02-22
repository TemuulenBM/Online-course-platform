import { Injectable, NotFoundException } from '@nestjs/common';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

/**
 * Хичээлийн session авах use case (lessonId-аар).
 */
@Injectable()
export class GetLiveSessionByLessonUseCase {
  constructor(private readonly liveClassesCacheService: LiveClassesCacheService) {}

  async execute(lessonId: string): Promise<LiveSessionEntity> {
    const session = await this.liveClassesCacheService.getSessionByLesson(lessonId);
    if (!session) {
      throw new NotFoundException('Энэ хичээлд шууд хичээл олдсонгүй');
    }
    return session;
  }
}
