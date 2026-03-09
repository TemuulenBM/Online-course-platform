import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { DiscussionPostRepository } from '../../../discussions/infrastructure/repositories/discussion-post.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';
import { DlqRepository } from '../../../../common/dlq/dlq.repository';

/** Хүлээгдэж буй зүйлүүдийн тоо авах use case */
@Injectable()
export class GetPendingItemsUseCase {
  private readonly logger = new Logger(GetPendingItemsUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly postRepository: DiscussionPostRepository,
    private readonly cacheService: AdminCacheService,
    private readonly dlqRepository: DlqRepository,
  ) {}

  async execute() {
    const cached = await this.cacheService.getPendingItems();
    if (cached) return cached;

    const [pendingOrders, processingOrders, flaggedPosts, failedJobs] = await Promise.all([
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'PROCESSING' } }),
      this.postRepository.countFlagged(),
      this.dlqRepository.countPending(),
    ]);

    const result = {
      pendingOrders,
      processingOrders,
      flaggedPosts,
      failedJobs,
      totalPending: pendingOrders + processingOrders + flaggedPosts + failedJobs,
    };

    await this.cacheService.setPendingItems(result);
    this.logger.debug('Хүлээгдэж буй зүйлүүд тооцоологдлоо');
    return result;
  }
}
