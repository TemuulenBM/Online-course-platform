import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { SessionAttendeeRepository } from '../../infrastructure/repositories/session-attendee.repository';
import { SessionAttendeeEntity } from '../../domain/entities/session-attendee.entity';

/**
 * Session-ийн оролцогчдын жагсаалт авах use case.
 * Зөвхөн instructor/ADMIN хандах боломжтой.
 */
@Injectable()
export class GetAttendeesUseCase {
  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly sessionAttendeeRepository: SessionAttendeeRepository,
  ) {}

  async execute(
    sessionId: string,
    userId: string,
    userRole: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: SessionAttendeeEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    /** 1. Session олдох эсэх */
    const session = await this.liveSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Шууд хичээл олдсонгүй');
    }

    /** 2. Эрхийн шалгалт — instructor / ADMIN */
    if (userRole !== 'ADMIN' && session.instructorId !== userId) {
      throw new ForbiddenException('Зөвхөн багш эсвэл админ оролцогчдыг харах боломжтой');
    }

    return this.sessionAttendeeRepository.findBySessionId(sessionId, options);
  }
}
