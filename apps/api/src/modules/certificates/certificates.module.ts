import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { CoursesModule } from '../courses/courses.module';

// Controller
import { CertificatesController } from './interface/controllers/certificates.controller';

// Use Cases
import { GenerateCertificateUseCase } from './application/use-cases/generate-certificate.use-case';
import { ListMyCertificatesUseCase } from './application/use-cases/list-my-certificates.use-case';
import { ListCourseCertificatesUseCase } from './application/use-cases/list-course-certificates.use-case';
import { GetCertificateUseCase } from './application/use-cases/get-certificate.use-case';
import { VerifyCertificateUseCase } from './application/use-cases/verify-certificate.use-case';
import { DeleteCertificateUseCase } from './application/use-cases/delete-certificate.use-case';

// Infrastructure
import { CertificateRepository } from './infrastructure/repositories/certificate.repository';
import { CertificateCacheService } from './infrastructure/services/certificate-cache.service';
import { PdfGeneratorService } from './infrastructure/services/pdf-generator.service';
import { QrCodeService } from './infrastructure/services/qr-code.service';
import { CertificateProcessor } from './infrastructure/services/certificate.processor';

/**
 * Certificates модуль.
 * Сургалт дуусгасан оюутанд сертификат үүсгэх, PDF + QR код баталгаажуулалт,
 * Bull Queue-ээр background-д PDF үүсгэх, нийтийн verification endpoint.
 */
@Module({
  imports: [
    BullModule.registerQueue({ name: 'certificates' }),
    ConfigModule,
    EnrollmentsModule,
    CoursesModule,
  ],
  controllers: [CertificatesController],
  providers: [
    // Use Cases
    GenerateCertificateUseCase,
    ListMyCertificatesUseCase,
    ListCourseCertificatesUseCase,
    GetCertificateUseCase,
    VerifyCertificateUseCase,
    DeleteCertificateUseCase,
    // Infrastructure
    CertificateRepository,
    CertificateCacheService,
    PdfGeneratorService,
    QrCodeService,
    CertificateProcessor,
    // STORAGE_SERVICE — StorageModule (@Global)-аас хангагдана
  ],
  exports: [CertificateRepository],
})
export class CertificatesModule {}
