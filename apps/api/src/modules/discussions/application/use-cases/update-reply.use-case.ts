import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';

/**
 * Хариулт шинэчлэх use case.
 * Зөвхөн хариултын эзэмшигч эсвэл ADMIN шинэчлэх боломжтой.
 */
@Injectable()
export class UpdateReplyUseCase {
  private readonly logger = new Logger(UpdateReplyUseCase.name);

  constructor(
    private readonly postRepository: DiscussionPostRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(
    userId: string,
    role: string,
    postId: string,
    replyId: string,
    dto: {
      content: string;
      contentHtml: string;
    },
  ): Promise<DiscussionPostEntity> {
    /** 1. Нийтлэл олох */
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Нийтлэл олдсонгүй');
    }

    /** 2. Хариулт олох */
    const reply = post.replies.find((r) => r.replyId === replyId);
    if (!reply) {
      throw new NotFoundException('Хариулт олдсонгүй');
    }

    /** 3. Эзэмшигч эсвэл ADMIN эрх шалгах */
    if (reply.authorId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Зөвхөн хариултын эзэмшигч эсвэл админ шинэчлэх боломжтой');
    }

    /** 4. Хариулт шинэчлэх */
    const updated = await this.postRepository.updateReply(postId, replyId, {
      content: dto.content,
      contentHtml: dto.contentHtml,
    });

    /** 5. Кэш устгах */
    await this.cacheService.invalidatePost(postId);

    this.logger.log(`Хариулт шинэчлэгдлээ: ${replyId} — нийтлэл: ${postId}, хэрэглэгч: ${userId}`);

    return updated!;
  }
}
