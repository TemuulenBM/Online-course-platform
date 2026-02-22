import { Injectable, NotFoundException } from '@nestjs/common';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

/**
 * Session дэлгэрэнгүй авах use case (ID-аар).
 */
@Injectable()
export class GetLiveSessionUseCase {
  constructor(private readonly liveClassesCacheService: LiveClassesCacheService) {}

  async execute(id: string): Promise<LiveSessionEntity> {
    const session = await this.liveClassesCacheService.getSession(id);
    if (!session) {
      throw new NotFoundException('Шууд хичээл олдсонгүй');
    }
    return session;
  }
}
