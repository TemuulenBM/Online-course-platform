import { Injectable, Logger } from '@nestjs/common';
import { DiscussionPostRepository } from '../../../discussions/infrastructure/repositories/discussion-post.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';

/** Moderation статистик авах use case */
@Injectable()
export class GetModerationStatsUseCase {
  private readonly logger = new Logger(GetModerationStatsUseCase.name);

  constructor(
    private readonly postRepository: DiscussionPostRepository,
    private readonly cacheService: AdminCacheService,
  ) {}

  async execute() {
    const cached = await this.cacheService.getModerationStats<{
      flaggedCount: number;
      lockedCount: number;
    }>();
    if (cached) return cached;

    const [flaggedCount, lockedCount] = await Promise.all([
      this.postRepository.countFlagged(),
      this.postRepository.countLocked(),
    ]);

    const result = { flaggedCount, lockedCount };
    await this.cacheService.setModerationStats(result);

    this.logger.debug(`Moderation stats: flagged=${flaggedCount}, locked=${lockedCount}`);
    return result;
  }
}
