import { Injectable } from '@nestjs/common';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

/**
 * Удахгүй эхлэх session жагсаалт авах use case.
 * Public endpoint — бүгдэд харагдана.
 */
@Injectable()
export class ListUpcomingSessionsUseCase {
  constructor(private readonly liveSessionRepository: LiveSessionRepository) {}

  async execute(options: { page: number; limit: number }): Promise<{
    data: LiveSessionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.liveSessionRepository.findUpcoming(options);
  }
}
