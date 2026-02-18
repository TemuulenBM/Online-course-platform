import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { CertificateRepository } from '../repositories/certificate.repository';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

/** Сертификатын кэшийн TTL — 15 минут (секундээр) */
const CERTIFICATE_CACHE_TTL = 900;

/**
 * Сертификатын кэш сервис.
 * Redis-д сертификатын мэдээлэл кэшлэж, DB ачааллыг бууруулна.
 */
@Injectable()
export class CertificateCacheService {
  private readonly logger = new Logger(CertificateCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly certificateRepository: CertificateRepository,
  ) {}

  /** ID-аар сертификат авах — кэшээс эхлээд, байхгүй бол DB-ээс */
  async getCertificate(certificateId: string): Promise<CertificateEntity | null> {
    const cacheKey = `certificate:${certificateId}`;

    const cached =
      await this.redisService.get<ReturnType<CertificateEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс сертификат олдлоо: ${certificateId}`);
      return new CertificateEntity({
        ...cached,
        issuedAt: new Date(cached.issuedAt),
        createdAt: new Date(cached.createdAt),
      });
    }

    const certificate = await this.certificateRepository.findById(certificateId);
    if (certificate) {
      await this.redisService.set(cacheKey, certificate.toResponse(), CERTIFICATE_CACHE_TTL);
      this.logger.debug(`Сертификат кэшлэгдлээ: ${certificateId}`);
    }

    return certificate;
  }

  /** Баталгаажуулалтын кодоор сертификат авах — кэшээс эхлээд */
  async getByVerificationCode(verificationCode: string): Promise<CertificateEntity | null> {
    const cacheKey = `certificate:verify:${verificationCode}`;

    const cached =
      await this.redisService.get<ReturnType<CertificateEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс баталгаажуулалт олдлоо: ${verificationCode}`);
      return new CertificateEntity({
        ...cached,
        issuedAt: new Date(cached.issuedAt),
        createdAt: new Date(cached.createdAt),
      });
    }

    const certificate = await this.certificateRepository.findByVerificationCode(verificationCode);
    if (certificate) {
      await this.redisService.set(cacheKey, certificate.toResponse(), CERTIFICATE_CACHE_TTL);
      this.logger.debug(`Баталгаажуулалт кэшлэгдлээ: ${verificationCode}`);
    }

    return certificate;
  }

  /** Бүх холбогдох кэш устгах */
  async invalidateAll(certificateId: string, verificationCode: string): Promise<void> {
    await Promise.all([
      this.redisService.del(`certificate:${certificateId}`),
      this.redisService.del(`certificate:verify:${verificationCode}`),
    ]);
    this.logger.debug(`Сертификатын кэш устгагдлаа: ${certificateId}`);
  }
}
