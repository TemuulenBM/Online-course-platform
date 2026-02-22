import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { DiscussionPostRepository } from '../../../discussions/infrastructure/repositories/discussion-post.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';

/** Хүлээгдэж буй зүйлүүдийн тоо авах use case */
@Injectable()
export class GetPendingItemsUseCase {
  private readonly logger = new Logger(GetPendingItemsUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly postRepository: DiscussionPostRepository,
    private readonly cacheService: AdminCacheService,
  ) {}

  async execute() {
    const cached = await this.cacheService.getPendingItems();
    if (cached) return cached;

    const [pendingOrders, processingOrders, flaggedPosts] = await Promise.all([
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'PROCESSING' } }),
      this.postRepository.countFlagged(),
    ]);

    const result = {
      pendingOrders,
      processingOrders,
      flaggedPosts,
      totalPending: pendingOrders + processingOrders + flaggedPosts,
    };

    await this.cacheService.setPendingItems(result);
    this.logger.debug('Хүлээгдэж буй зүйлүүд тооцоологдлоо');
    return result;
  }
}
