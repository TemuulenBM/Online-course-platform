import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CertificateCacheService } from '../../infrastructure/services/certificate-cache.service';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

/**
 * Сертификат баталгаажуулах use case.
 * @Public endpoint — JWT шаардлагагүй.
 * Verification code-оор сертификатыг хайж, хэрэглэгч + сургалтын мэдээлэл буцаана.
 */
@Injectable()
export class VerifyCertificateUseCase {
  private readonly logger = new Logger(VerifyCertificateUseCase.name);

  constructor(private readonly certificateCacheService: CertificateCacheService) {}

  async execute(verificationCode: string): Promise<CertificateEntity> {
    /** Verification code-оор хайх (кэшээс эхлээд) */
    const certificate = await this.certificateCacheService.getByVerificationCode(verificationCode);
    if (!certificate) {
      throw new NotFoundException('Баталгаажуулалтын код буруу байна эсвэл сертификат олдсонгүй');
    }

    this.logger.debug(`Сертификат баталгаажуулагдлаа: ${certificate.certificateNumber}`);

    return certificate;
  }
}
