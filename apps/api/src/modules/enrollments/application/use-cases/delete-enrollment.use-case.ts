import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';

/**
 * Элсэлт устгах use case.
 * Зөвхөн ADMIN. Hard delete.
 */
@Injectable()
export class DeleteEnrollmentUseCase {
  private readonly logger = new Logger(DeleteEnrollmentUseCase.name);

  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly enrollmentCacheService: EnrollmentCacheService,
  ) {}

  async execute(enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException('Элсэлт олдсонгүй');
    }

    await this.enrollmentRepository.delete(enrollmentId);
    await this.enrollmentCacheService.invalidateAll(
      enrollmentId,
      enrollment.userId,
      enrollment.courseId,
    );
    this.logger.log(`Элсэлт устгагдлаа: ${enrollmentId}`);
  }
}
