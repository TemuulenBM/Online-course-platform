import { Injectable } from '@nestjs/common';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';

/**
 * Элсэлтийн статус шалгах use case.
 * NotFoundException шидэхгүй — enrolled: false буцаана.
 */
@Injectable()
export class CheckEnrollmentUseCase {
  constructor(private readonly enrollmentCacheService: EnrollmentCacheService) {}

  async execute(userId: string, courseId: string) {
    const enrollment = await this.enrollmentCacheService.checkEnrollment(userId, courseId);

    return {
      enrolled: !!enrollment,
      status: enrollment?.status ?? null,
      enrollmentId: enrollment?.id ?? null,
      enrolledAt: enrollment?.enrolledAt ?? null,
    };
  }
}
