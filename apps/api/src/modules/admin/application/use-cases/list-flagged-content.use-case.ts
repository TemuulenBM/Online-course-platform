import { Injectable, Logger } from '@nestjs/common';
import { DiscussionPostRepository } from '../../../discussions/infrastructure/repositories/discussion-post.repository';
import { FlaggedContentItem } from '../../domain/entities/flagged-content.entity';

/** Тэмдэглэгдсэн контентийн жагсаалт авах use case */
@Injectable()
export class ListFlaggedContentUseCase {
  private readonly logger = new Logger(ListFlaggedContentUseCase.name);

  constructor(private readonly postRepository: DiscussionPostRepository) {}

  async execute(params: { page: number; limit: number; courseId?: string }) {
    const result = await this.postRepository.findFlagged(
      params.page,
      params.limit,
      params.courseId,
    );

    const data = result.data.map(
      (post) =>
        new FlaggedContentItem({
          id: post.id,
          courseId: post.courseId,
          authorId: post.authorId,
          postType: post.postType,
          title: post.title ?? null,
          contentPreview: post.content.substring(0, 200),
          flagReason: post.flagReason ?? null,
          isFlagged: post.isFlagged,
          isLocked: post.isLocked,
          viewsCount: post.viewsCount,
          createdAt: post.createdAt,
        }),
    );

    return {
      data: data.map((item) => item.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
