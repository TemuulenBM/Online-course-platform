import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';
import { ReplyVO } from '../../domain/value-objects/reply.vo';
import { DiscussionPostRepository } from '../repositories/discussion-post.repository';

/** Кэшийн TTL — 15 минут (секундээр) */
const CACHE_TTL = 900;

/** Кэш түлхүүрийн prefix-үүд */
const POST_CACHE_PREFIX = 'discussion:post:';
const COMMENT_CACHE_PREFIX = 'comment:';

/**
 * Хэлэлцүүлгийн кэш сервис.
 * Redis-д нийтлэл/сэтгэгдлийн мэдээлэл кэшлэж, DB ачааллыг бууруулна.
 * Жагсаалт кэшлэхгүй (filter/search/sort олон хослолтой).
 */
@Injectable()
export class DiscussionCacheService {
  private readonly logger = new Logger(DiscussionCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly postRepository: DiscussionPostRepository,
  ) {}

  /** Нийтлэл авах — Redis кэшээс эхлээд, байхгүй бол DB-ээс */
  async getPostById(id: string): Promise<DiscussionPostEntity | null> {
    const cacheKey = `${POST_CACHE_PREFIX}${id}`;

    const cached =
      await this.redisService.get<ReturnType<DiscussionPostEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс нийтлэл олдлоо: ${id}`);
      return this.fromCachedPost(cached);
    }

    const post = await this.postRepository.findById(id);
    if (post) {
      await this.redisService.set(cacheKey, post.toResponse(), CACHE_TTL);
      this.logger.debug(`Нийтлэл кэшлэгдлээ: ${id}`);
    }

    return post;
  }

  /** Нийтлэлийн кэш устгах */
  async invalidatePost(id: string): Promise<void> {
    await this.redisService.del(`${POST_CACHE_PREFIX}${id}`);
    this.logger.debug(`Нийтлэлийн кэш устгагдлаа: ${id}`);
  }

  /** Сэтгэгдлийн кэш устгах */
  async invalidateComment(id: string): Promise<void> {
    await this.redisService.del(`${COMMENT_CACHE_PREFIX}${id}`);
    this.logger.debug(`Сэтгэгдлийн кэш устгагдлаа: ${id}`);
  }

  /** Кэш дэх JSON-г entity рүү хөрвүүлэх */
  private fromCachedPost(
    cached: ReturnType<DiscussionPostEntity['toResponse']>,
  ): DiscussionPostEntity {
    return new DiscussionPostEntity({
      id: cached.id,
      courseId: cached.courseId,
      lessonId: cached.lessonId ?? undefined,
      threadId: cached.threadId ?? undefined,
      authorId: cached.authorId,
      postType: cached.postType,
      title: cached.title ?? undefined,
      content: cached.content,
      contentHtml: cached.contentHtml,
      isAnswered: cached.isAnswered,
      acceptedAnswerId: cached.acceptedAnswerId ?? undefined,
      upvotes: cached.upvotes,
      downvotes: cached.downvotes,
      voteScore: cached.voteScore,
      replies: (cached.replies ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: Record<string, any>) =>
          new ReplyVO({
            replyId: r.replyId,
            authorId: r.authorId,
            content: r.content,
            contentHtml: r.contentHtml,
            upvotes: r.upvotes,
            downvotes: r.downvotes,
            isAccepted: r.isAccepted,
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
          }),
      ),
      voters: [],
      tags: cached.tags ?? [],
      viewsCount: cached.viewsCount,
      isPinned: cached.isPinned,
      isLocked: cached.isLocked,
      isFlagged: cached.isFlagged,
      flagReason: cached.flagReason ?? undefined,
      createdAt: new Date(cached.createdAt),
      updatedAt: new Date(cached.updatedAt),
    });
  }
}
