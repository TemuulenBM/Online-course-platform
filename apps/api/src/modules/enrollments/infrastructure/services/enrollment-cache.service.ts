import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';
import { EnrollmentRepository } from '../repositories/enrollment.repository';

/** Элсэлтийн кэшийн TTL — 15 минут (секундээр) */
const ENROLLMENT_CACHE_TTL = 900;

/** Кэш түлхүүрийн загварууд */
const ENROLLMENT_CACHE_PREFIX = 'enrollment:';
const ENROLLMENT_CHECK_CACHE_PREFIX = 'enrollment:check:';

/**
 * Элсэлтийн кэш сервис.
 * Redis-д элсэлтийн мэдээлэл кэшлэж, DB ачааллыг бууруулна.
 */
@Injectable()
export class EnrollmentCacheService {
  private readonly logger = new Logger(EnrollmentCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  /** Элсэлт авах — Redis кэшээс эхлээд, байхгүй бол DB-ээс */
  async getEnrollment(enrollmentId: string): Promise<EnrollmentEntity | null> {
    const cacheKey = `${ENROLLMENT_CACHE_PREFIX}${enrollmentId}`;

    const cached =
      await this.redisService.get<ReturnType<EnrollmentEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс элсэлт олдлоо: ${enrollmentId}`);
      return new EnrollmentEntity({
        ...cached,
        enrolledAt: new Date(cached.enrolledAt),
        expiresAt: cached.expiresAt ? new Date(cached.expiresAt) : null,
        completedAt: cached.completedAt ? new Date(cached.completedAt) : null,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (enrollment) {
      await this.redisService.set(cacheKey, enrollment.toResponse(), ENROLLMENT_CACHE_TTL);
      this.logger.debug(`Элсэлт кэшлэгдлээ: ${enrollmentId}`);
    }

    return enrollment;
  }

  /** Элсэлтийн статус шалгах — userId + courseId-аар кэшнээс */
  async checkEnrollment(userId: string, courseId: string): Promise<EnrollmentEntity | null> {
    const cacheKey = `${ENROLLMENT_CHECK_CACHE_PREFIX}${userId}:${courseId}`;

    const cached =
      await this.redisService.get<ReturnType<EnrollmentEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс элсэлт шалгалт олдлоо: ${userId}:${courseId}`);
      return new EnrollmentEntity({
        ...cached,
        enrolledAt: new Date(cached.enrolledAt),
        expiresAt: cached.expiresAt ? new Date(cached.expiresAt) : null,
        completedAt: cached.completedAt ? new Date(cached.completedAt) : null,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (enrollment) {
      await this.redisService.set(cacheKey, enrollment.toResponse(), ENROLLMENT_CACHE_TTL);
      this.logger.debug(`Элсэлт шалгалт кэшлэгдлээ: ${userId}:${courseId}`);
    }

    return enrollment;
  }

  /** Бүх холбогдох кэш устгах (create/update/delete үед дуудна) */
  async invalidateAll(enrollmentId: string, userId: string, courseId: string): Promise<void> {
    await Promise.all([
      this.redisService.del(`${ENROLLMENT_CACHE_PREFIX}${enrollmentId}`),
      this.redisService.del(`${ENROLLMENT_CHECK_CACHE_PREFIX}${userId}:${courseId}`),
    ]);
    this.logger.debug(`Элсэлтийн кэш устгагдлаа: ${enrollmentId}`);
  }
}
