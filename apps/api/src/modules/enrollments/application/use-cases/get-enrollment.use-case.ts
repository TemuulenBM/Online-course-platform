import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

/**
 * Элсэлтийн дэлгэрэнгүй авах use case.
 * Эрхийн шалгалт: өөрийн элсэлт, сургалтын эзэмшигч, эсвэл админ.
 */
@Injectable()
export class GetEnrollmentUseCase {
  constructor(private readonly enrollmentCacheService: EnrollmentCacheService) {}

  async execute(
    enrollmentId: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentCacheService.getEnrollment(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException('Элсэлт олдсонгүй');
    }

    /** Эрхийн шалгалт: өөрийн элсэлт, сургалтын эзэмшигч, эсвэл админ */
    if (
      enrollment.userId !== currentUserId &&
      enrollment.courseInstructorId !== currentUserId &&
      currentUserRole !== 'ADMIN'
    ) {
      throw new ForbiddenException('Энэ элсэлтийн мэдээлэл харах эрхгүй');
    }

    return enrollment;
  }
}
