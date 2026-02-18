import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';

/**
 * Нийтлэлийн дэлгэрэнгүй мэдээлэл авах use case.
 * Redis кэшээс read-through хандалт хийж, үзсэн тоог нэмнэ.
 */
@Injectable()
export class GetPostUseCase {
  private readonly logger = new Logger(GetPostUseCase.name);

  constructor(
    private readonly cacheService: DiscussionCacheService,
    private readonly postRepository: DiscussionPostRepository,
  ) {}

  async execute(postId: string): Promise<DiscussionPostEntity> {
    /** 1. Кэшээс нийтлэл авах (read-through) */
    const post = await this.cacheService.getPostById(postId);
    if (!post) {
      throw new NotFoundException('Нийтлэл олдсонгүй');
    }

    /** 2. Үзсэн тоог нэмэх (fire-and-forget) */
    this.postRepository.incrementViewCount(postId).catch((err) => {
      this.logger.warn(`Үзсэн тоо нэмэхэд алдаа гарлаа: ${postId} — ${err.message}`);
    });

    this.logger.debug(`Нийтлэл авлаа: ${postId}`);

    return post;
  }
}
