import { Injectable } from '@nestjs/common';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';

/**
 * Элсэлтийн статус шалгах use case.
 * NotFoundException шидэхгүй — isEnrolled: false буцаана.
 * EnrollmentCheck shared type-тай нийцсэн бүтэц буцаана.
 */
@Injectable()
export class CheckEnrollmentUseCase {
  constructor(private readonly enrollmentCacheService: EnrollmentCacheService) {}

  async execute(userId: string, courseId: string) {
    const enrollment = await this.enrollmentCacheService.checkEnrollment(userId, courseId);

    if (!enrollment) {
      return { isEnrolled: false, enrollment: undefined };
    }

    return {
      isEnrolled: true,
      enrollment: {
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        /** Prisma ACTIVE → lowercase active (shared type-тай нийцүүлэх) */
        status: enrollment.status.toLowerCase() as 'active' | 'completed' | 'cancelled' | 'expired',
        enrolledAt: enrollment.enrolledAt.toISOString(),
        expiresAt: enrollment.expiresAt?.toISOString(),
        completedAt: enrollment.completedAt?.toISOString(),
      },
    };
  }
}
