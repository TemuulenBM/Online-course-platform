import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { LiveSessionRepository } from '../repositories/live-session.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

/** Live class кэшийн TTL — 15 минут (секундээр) */
const LIVE_CLASS_CACHE_TTL = 900;

/**
 * Live class кэш сервис.
 * Redis-д session мэдээлэл кэшлэж, DB ачааллыг бууруулна.
 */
@Injectable()
export class LiveClassesCacheService {
  private readonly logger = new Logger(LiveClassesCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly liveSessionRepository: LiveSessionRepository,
  ) {}

  /** ID-аар session авах — кэшээс эхлээд, байхгүй бол DB-ээс */
  async getSession(sessionId: string): Promise<LiveSessionEntity | null> {
    const cacheKey = `live-session:${sessionId}`;

    const cached = await this.redisService.get<any>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс session олдлоо: ${sessionId}`);
      return this.fromCache(cached);
    }

    const session = await this.liveSessionRepository.findById(sessionId);
    if (session) {
      await this.redisService.set(cacheKey, session.toResponse(), LIVE_CLASS_CACHE_TTL);
      this.logger.debug(`Session кэшлэгдлээ: ${sessionId}`);
    }

    return session;
  }

  /** lessonId-аар session авах */
  async getSessionByLesson(lessonId: string): Promise<LiveSessionEntity | null> {
    const cacheKey = `live-session:lesson:${lessonId}`;

    const cached = await this.redisService.get<any>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс session олдлоо: lessonId=${lessonId}`);
      return this.fromCache(cached);
    }

    const session = await this.liveSessionRepository.findByLessonId(lessonId);
    if (session) {
      await this.redisService.set(cacheKey, session.toResponse(), LIVE_CLASS_CACHE_TTL);
      this.logger.debug(`Session кэшлэгдлээ: lessonId=${lessonId}`);
    }

    return session;
  }

  /** Session кэш устгах */
  async invalidateSession(sessionId: string, lessonId?: string): Promise<void> {
    const keys = [`live-session:${sessionId}`];
    if (lessonId) {
      keys.push(`live-session:lesson:${lessonId}`);
    }
    await Promise.all(keys.map((key) => this.redisService.del(key)));
    this.logger.debug(`Session кэш устгагдлаа: ${sessionId}`);
  }

  /** Кэшээс entity сэргээх */
  private fromCache(cached: any): LiveSessionEntity {
    return new LiveSessionEntity({
      id: cached.id,
      lessonId: cached.lessonId,
      instructorId: cached.instructorId,
      title: cached.title,
      description: cached.description,
      scheduledStart: new Date(cached.scheduledStart),
      scheduledEnd: new Date(cached.scheduledEnd),
      actualStart: cached.actualStart ? new Date(cached.actualStart) : null,
      actualEnd: cached.actualEnd ? new Date(cached.actualEnd) : null,
      meetingUrl: cached.meetingUrl,
      meetingId: cached.meetingId,
      recordingUrl: cached.recordingUrl,
      status: cached.status,
      createdAt: new Date(cached.createdAt),
      updatedAt: new Date(cached.updatedAt),
      lessonTitle: cached.lessonTitle,
      courseId: cached.courseId,
      courseTitle: cached.courseTitle,
      instructorName: cached.instructorName,
      attendeeCount: cached.attendeeCount,
    });
  }
}
