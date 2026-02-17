import { Injectable } from '@nestjs/common';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { ListEnrollmentsQueryDto } from '../../dto/list-enrollments-query.dto';

/**
 * Миний элсэлтүүдийн жагсаалт авах use case.
 */
@Injectable()
export class ListMyEnrollmentsUseCase {
  constructor(private readonly enrollmentRepository: EnrollmentRepository) {}

  async execute(userId: string, query: ListEnrollmentsQueryDto) {
    const result = await this.enrollmentRepository.findByUserId(userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status,
    });

    return {
      data: result.data.map((e) => e.toResponse()),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }
}
