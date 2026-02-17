import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

/**
 * Элсэлт цуцлах use case.
 * Зөвхөн ACTIVE → CANCELLED. Эрхийн шалгалт: өөрийн элсэлт эсвэл админ.
 */
@Injectable()
export class CancelEnrollmentUseCase {
  private readonly logger = new Logger(CancelEnrollmentUseCase.name);

  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly enrollmentCacheService: EnrollmentCacheService,
  ) {}

  async execute(
    enrollmentId: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException('Элсэлт олдсонгүй');
    }

    /** Эрхийн шалгалт: өөрийн элсэлт эсвэл админ */
    if (enrollment.userId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ элсэлтийг цуцлах эрхгүй');
    }

    /** Зөвхөн идэвхтэй элсэлтийг цуцлах боломжтой */
    if (enrollment.status !== 'active') {
      throw new ConflictException('Зөвхөн идэвхтэй элсэлтийг цуцлах боломжтой');
    }

    const cancelled = await this.enrollmentRepository.update(enrollmentId, {
      status: 'cancelled',
    });

    await this.enrollmentCacheService.invalidateAll(
      enrollmentId,
      enrollment.userId,
      enrollment.courseId,
    );
    this.logger.log(`Элсэлт цуцлагдлаа: ${enrollmentId}`);
    return cancelled;
  }
}
