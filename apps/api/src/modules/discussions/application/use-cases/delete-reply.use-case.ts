import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';

/**
 * Хариулт устгах use case.
 * Зөвхөн хариултын эзэмшигч эсвэл ADMIN устгах боломжтой.
 * Хэрэв устгасан хариулт нь зөвшөөрөгдсөн хариулт бол accepted answer цуцлагдана.
 */
@Injectable()
export class DeleteReplyUseCase {
  private readonly logger = new Logger(DeleteReplyUseCase.name);

  constructor(
    private readonly postRepository: DiscussionPostRepository,
    private readonly cacheService: DiscussionCacheService,
  ) {}

  async execute(userId: string, role: string, postId: string, replyId: string): Promise<void> {
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
      throw new ForbiddenException('Зөвхөн хариултын эзэмшигч эсвэл админ устгах боломжтой');
    }

    /** 4. Хэрэв устгасан хариулт нь accepted answer бол цуцлах */
    if (reply.isAccepted) {
      await this.postRepository.clearAcceptedAnswer(postId);
    }

    /** 5. Хариулт устгах */
    await this.postRepository.removeReply(postId, replyId);

    /** 6. Кэш устгах */
    await this.cacheService.invalidatePost(postId);

    this.logger.log(`Хариулт устгагдлаа: ${replyId} — нийтлэл: ${postId}, хэрэглэгч: ${userId}`);
  }
}
