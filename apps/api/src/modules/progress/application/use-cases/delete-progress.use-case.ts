import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProgressRepository } from '../../infrastructure/repositories/progress.repository';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';

/**
 * Ахиц устгах use case.
 * Зөвхөн ADMIN эрхтэй хэрэглэгч дуудаж болно.
 */
@Injectable()
export class DeleteProgressUseCase {
  private readonly logger = new Logger(DeleteProgressUseCase.name);

  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly progressCacheService: ProgressCacheService,
  ) {}

  async execute(id: string): Promise<void> {
    /** 1. Ахиц олдох эсэх шалгах */
    const progress = await this.progressRepository.findById(id);
    if (!progress) {
      throw new NotFoundException('Ахиц олдсонгүй');
    }

    /** 2. Устгах */
    await this.progressRepository.delete(id);

    /** 3. Кэш invalidate */
    await this.progressCacheService.invalidateAll(
      progress.userId,
      progress.lessonId,
      progress.courseId!,
    );

    this.logger.log(`Ахиц устгагдлаа: ${id}`);
  }
}
