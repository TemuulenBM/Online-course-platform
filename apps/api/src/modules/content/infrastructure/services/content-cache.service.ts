import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { ContentEntity } from '../../domain/entities/content.entity';
import { ContentRepository } from '../repositories/content.repository';
import { VideoContentVO } from '../../domain/value-objects/video-content.vo';
import { TextContentVO } from '../../domain/value-objects/text-content.vo';
import { AttachmentVO } from '../../domain/value-objects/attachment.vo';

/** Контент кэшийн TTL — 15 минут (секундээр) */
const CONTENT_CACHE_TTL = 900;

/** Кэш түлхүүрийн prefix */
const CONTENT_CACHE_PREFIX = 'content:lesson:';

/**
 * Контент кэш сервис.
 * Redis-д хичээлийн контент кэшлэж, MongoDB ачааллыг бууруулна.
 */
@Injectable()
export class ContentCacheService {
  private readonly logger = new Logger(ContentCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly contentRepository: ContentRepository,
  ) {}

  /** Контент авах — Redis кэшээс эхлээд, байхгүй бол MongoDB-ээс */
  async getContent(lessonId: string): Promise<ContentEntity | null> {
    const cacheKey = `${CONTENT_CACHE_PREFIX}${lessonId}`;

    const cached = await this.redisService.get<ReturnType<ContentEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс контент олдлоо: ${lessonId}`);
      return this.fromCache(cached);
    }

    const content = await this.contentRepository.findByLessonId(lessonId);
    if (content) {
      await this.redisService.set(cacheKey, content.toResponse(), CONTENT_CACHE_TTL);
      this.logger.debug(`Контент кэшлэгдлээ: ${lessonId}`);
    }

    return content;
  }

  /** Кэш invalidate */
  async invalidateContent(lessonId: string): Promise<void> {
    const cacheKey = `${CONTENT_CACHE_PREFIX}${lessonId}`;
    await this.redisService.del(cacheKey);
    this.logger.debug(`Контент кэш устгагдлаа: ${lessonId}`);
  }

  /** Кэшлэгдсэн өгөгдлөөс ContentEntity үүсгэнэ */
  private fromCache(cached: ReturnType<ContentEntity['toResponse']>): ContentEntity {
    let videoContent: VideoContentVO | undefined;
    if (cached.videoContent) {
      videoContent = new VideoContentVO(cached.videoContent);
    }

    let textContent: TextContentVO | undefined;
    if (cached.textContent) {
      textContent = new TextContentVO(cached.textContent);
    }

    const attachments = (cached.attachments ?? []).map((a) => new AttachmentVO(a));

    return new ContentEntity({
      id: cached.id,
      lessonId: cached.lessonId,
      contentType: cached.contentType,
      videoContent,
      textContent,
      attachments,
      createdAt: new Date(cached.createdAt),
      updatedAt: new Date(cached.updatedAt),
    });
  }
}
