import { Injectable, Logger } from '@nestjs/common';
import { CertificateRepository } from '../../infrastructure/repositories/certificate.repository';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

/**
 * Миний сертификатуудын жагсаалт авах use case.
 * Хэрэглэгчийн бүх сертификатуудыг pagination-тэй буцаана.
 */
@Injectable()
export class ListMyCertificatesUseCase {
  private readonly logger = new Logger(ListMyCertificatesUseCase.name);

  constructor(private readonly certificateRepository: CertificateRepository) {}

  async execute(
    userId: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: CertificateEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.certificateRepository.findByUserId(userId, options);
  }
}
