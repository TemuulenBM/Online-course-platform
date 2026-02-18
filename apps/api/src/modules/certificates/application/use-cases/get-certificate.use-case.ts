import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CertificateCacheService } from '../../infrastructure/services/certificate-cache.service';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

/**
 * Сертификатын дэлгэрэнгүй авах use case.
 * Зөвхөн сертификатын эзэмшигч, сургалтын эзэмшигч эсвэл ADMIN хандах боломжтой.
 */
@Injectable()
export class GetCertificateUseCase {
  private readonly logger = new Logger(GetCertificateUseCase.name);

  constructor(private readonly certificateCacheService: CertificateCacheService) {}

  async execute(
    certificateId: string,
    userId: string,
    userRole: string,
  ): Promise<CertificateEntity> {
    /** 1. Сертификат авах (кэшээс эхлээд) */
    const certificate = await this.certificateCacheService.getCertificate(certificateId);
    if (!certificate) {
      throw new NotFoundException('Сертификат олдсонгүй');
    }

    /** 2. Эрхийн шалгалт — эзэмшигч / сургалтын багш / ADMIN */
    if (
      userRole !== 'ADMIN' &&
      certificate.userId !== userId &&
      certificate.courseInstructorId !== userId
    ) {
      throw new ForbiddenException('Энэ сертификатыг харах эрхгүй байна');
    }

    return certificate;
  }
}
