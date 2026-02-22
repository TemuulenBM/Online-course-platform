import { Injectable } from '@nestjs/common';
import { SessionAttendeeRepository } from '../../infrastructure/repositories/session-attendee.repository';

/**
 * Session-аас гарах use case.
 * leftAt + durationMinutes тооцоологдоно.
 */
@Injectable()
export class LeaveLiveSessionUseCase {
  constructor(private readonly sessionAttendeeRepository: SessionAttendeeRepository) {}

  async execute(sessionId: string, userId: string): Promise<{ durationMinutes: number }> {
    const attendee = await this.sessionAttendeeRepository.markLeft(sessionId, userId);

    /** Олдоогүй эсвэл аль хэдийн гарсан бол 0 буцаана */
    return { durationMinutes: attendee?.durationMinutes ?? 0 };
  }
}
