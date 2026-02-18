import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CertificateRepository } from '../../infrastructure/repositories/certificate.repository';
import { CertificateCacheService } from '../../infrastructure/services/certificate-cache.service';

/**
 * Сертификат устгах use case.
 * Зөвхөн ADMIN эрхтэй хэрэглэгч ашиглах боломжтой.
 */
@Injectable()
export class DeleteCertificateUseCase {
  private readonly logger = new Logger(DeleteCertificateUseCase.name);

  constructor(
    private readonly certificateRepository: CertificateRepository,
    private readonly certificateCacheService: CertificateCacheService,
  ) {}

  async execute(certificateId: string): Promise<void> {
    /** 1. Сертификат олдох эсэх шалгах */
    const certificate = await this.certificateRepository.findById(certificateId);
    if (!certificate) {
      throw new NotFoundException('Сертификат олдсонгүй');
    }

    /** 2. DB-ээс устгах */
    await this.certificateRepository.delete(certificateId);

    /** 3. Кэш invalidate */
    await this.certificateCacheService.invalidateAll(certificateId, certificate.verificationCode);

    this.logger.log(`Сертификат устгагдлаа: ${certificateId}`);
  }
}
