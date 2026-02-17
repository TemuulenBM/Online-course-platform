import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

/**
 * Элсэлт дуусгах use case.
 * ACTIVE → COMPLETED + completedAt тавина. Зөвхөн ADMIN (дараа Progress-оос автомат болно).
 */
@Injectable()
export class CompleteEnrollmentUseCase {
  private readonly logger = new Logger(CompleteEnrollmentUseCase.name);

  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly enrollmentCacheService: EnrollmentCacheService,
  ) {}

  async execute(enrollmentId: string): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException('Элсэлт олдсонгүй');
    }

    /** Зөвхөн идэвхтэй элсэлтийг дуусгах боломжтой */
    if (enrollment.status !== 'active') {
      throw new ConflictException('Зөвхөн идэвхтэй элсэлтийг дуусгах боломжтой');
    }

    const completed = await this.enrollmentRepository.update(enrollmentId, {
      status: 'completed',
      completedAt: new Date(),
    });

    await this.enrollmentCacheService.invalidateAll(
      enrollmentId,
      enrollment.userId,
      enrollment.courseId,
    );
    this.logger.log(`Элсэлт дууслаа: ${enrollmentId}`);
    return completed;
  }
}
