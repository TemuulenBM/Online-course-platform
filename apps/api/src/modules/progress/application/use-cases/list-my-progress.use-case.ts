import { Injectable } from '@nestjs/common';
import { ProgressRepository } from '../../infrastructure/repositories/progress.repository';

/**
 * Миний ахицуудыг жагсаах use case.
 * Хэрэглэгчийн бүх ахицыг pagination-тэйгээр буцаана.
 */
@Injectable()
export class ListMyProgressUseCase {
  constructor(private readonly progressRepository: ProgressRepository) {}

  async execute(
    userId: string,
    options: { page: number; limit: number },
  ) {
    const result = await this.progressRepository.findByUserId(
      userId,
      options,
    );

    return {
      data: result.data.map((p) => p.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
