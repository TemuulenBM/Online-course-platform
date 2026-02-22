import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DiscussionPostRepository } from '../../../discussions/infrastructure/repositories/discussion-post.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';
import { AuditLogService } from '../../infrastructure/services/audit-log.service';
import { NotificationService } from '../../../notifications/application/services/notification.service';

/** Тэмдэглэгдсэн контент хянах (approve/reject) use case */
@Injectable()
export class ReviewFlaggedContentUseCase {
  private readonly logger = new Logger(ReviewFlaggedContentUseCase.name);

  constructor(
    private readonly postRepository: DiscussionPostRepository,
    private readonly cacheService: AdminCacheService,
    private readonly auditLogService: AuditLogService,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(postId: string, action: 'approve' | 'reject', userId: string, reason?: string) {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Нийтлэл олдсонгүй');
    }

    if (action === 'approve') {
      /** Approve — flag арилгах */
      await this.postRepository.toggleFlag(postId, false);
      this.logger.debug(`Нийтлэл approve хийгдлээ: ${postId}`);
    } else {
      /** Reject — нийтлэл устгах + зохиогчид мэдэгдэх */
      await this.postRepository.delete(postId);

      await this.notificationService.send(post.authorId, {
        type: 'IN_APP',
        title: 'Нийтлэл устгагдлаа',
        message: `Таны нийтлэл дүрмийн зөрчлөөр устгагдлаа. ${reason ? `Шалтгаан: ${reason}` : ''}`,
        data: { postId, reason: reason ?? null },
      });
      this.logger.debug(`Нийтлэл reject хийгдлээ: ${postId}`);
    }

    /** Кэш invalidate */
    await this.cacheService.invalidateModeration();

    /** Audit log бүртгэх */
    await this.auditLogService.log({
      userId,
      action: action === 'approve' ? 'APPROVE' : 'REJECT',
      entityType: 'DISCUSSION_POST',
      entityId: postId,
      metadata: { reason, postTitle: post.title },
    });
  }
}
