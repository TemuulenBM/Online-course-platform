import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { SessionAttendeeRepository } from '../../infrastructure/repositories/session-attendee.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { SessionAttendeeEntity } from '../../domain/entities/session-attendee.entity';

/**
 * Session-ийн оролцогчдын жагсаалт авах use case.
 * Instructor/ADMIN эсвэл enrolled student хандах боломжтой.
 */
@Injectable()
export class GetAttendeesUseCase {
  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly sessionAttendeeRepository: SessionAttendeeRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
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

    /** 2. Эрхийн шалгалт — instructor / ADMIN / enrolled student */
    const isInstructor = session.instructorId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isInstructor && !isAdmin) {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(
        userId,
        session.courseId!,
      );
      if (!enrollment || enrollment.status !== 'active') {
        throw new ForbiddenException('Зөвхөн элсэлттэй хэрэглэгч оролцогчдыг харах боломжтой');
      }
    }

    return this.sessionAttendeeRepository.findBySessionId(sessionId, options);
  }
}
