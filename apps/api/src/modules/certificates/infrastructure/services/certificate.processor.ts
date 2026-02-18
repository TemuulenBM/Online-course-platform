import { Processor, Process } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { CertificateRepository } from '../repositories/certificate.repository';
import { CertificateCacheService } from './certificate-cache.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { QrCodeService } from './qr-code.service';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '../../../content/infrastructure/services/storage/storage.interface';
import {
  generateCertificateNumber,
  generateVerificationCode,
} from '../../../../common/utils/certificate.util';

/**
 * Сертификат үүсгэх Bull Queue processor.
 * Background-д PDF + QR код үүсгэж, файл хадгалж, DB шинэчилнэ.
 */
@Processor('certificates')
export class CertificateProcessor {
  private readonly logger = new Logger(CertificateProcessor.name);

  constructor(
    private readonly certificateRepository: CertificateRepository,
    private readonly certificateCacheService: CertificateCacheService,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly qrCodeService: QrCodeService,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
    private readonly configService: ConfigService,
  ) {}

  /** Сертификатын PDF + QR үүсгэх (certificateId-аар) */
  @Process('generate')
  async handleGenerate(job: Job<{ certificateId: string }>): Promise<void> {
    const { certificateId } = job.data;
    this.logger.log(`Сертификат үүсгэж эхэллээ: ${certificateId}`);

    /** 1. Certificate + User + Course мэдээлэл авах */
    const certificate = await this.certificateRepository.findById(certificateId);
    if (!certificate) {
      this.logger.error(`Сертификат олдсонгүй: ${certificateId}`);
      return;
    }

    /** 2. QR код үүсгэх (verification URL) */
    const appUrl = this.configService.get<string>('app.url') || 'http://localhost:3001';
    const verifyUrl = `${appUrl}/api/v1/certificates/verify/${certificate.verificationCode}`;
    const qrCodeBuffer = await this.qrCodeService.generateQrCodeBuffer(verifyUrl);
    const qrCodeDataUrl = await this.qrCodeService.generateQrCodeDataUrl(verifyUrl);

    /** 3. QR зургийг хадгалах */
    const qrPath = `certificates/${certificateId}/qr.png`;
    const { url: qrCodeUrl } = await this.storageService.upload(
      { buffer: qrCodeBuffer, size: qrCodeBuffer.length } as any,
      qrPath,
    );

    /** 4. PDF үүсгэх (QR data URL embed) */
    const pdfBuffer = await this.pdfGeneratorService.generateCertificatePdf({
      userName: certificate.userName || 'Student',
      courseTitle: certificate.courseTitle || 'Course',
      certificateNumber: certificate.certificateNumber,
      issuedAt: certificate.issuedAt,
      qrCodeDataUrl,
    });

    /** 5. PDF хадгалах */
    const pdfPath = `certificates/${certificateId}/certificate.pdf`;
    const { url: pdfUrl } = await this.storageService.upload(
      { buffer: pdfBuffer, size: pdfBuffer.length } as any,
      pdfPath,
    );

    /** 6. DB-д pdfUrl, qrCodeUrl шинэчлэх */
    await this.certificateRepository.update(certificateId, {
      pdfUrl,
      qrCodeUrl,
    });

    /** 7. Кэш invalidate */
    await this.certificateCacheService.invalidateAll(certificateId, certificate.verificationCode);

    this.logger.log(`Сертификат амжилттай үүслээ: ${certificateId} (PDF: ${pdfUrl})`);
  }

  /** Enrollment дуусахад автоматаар сертификат үүсгэх */
  @Process('generate-auto')
  async handleAutoGenerate(job: Job<{ userId: string; courseId: string }>): Promise<void> {
    const { userId, courseId } = job.data;
    this.logger.log(`Автомат сертификат үүсгэж эхэллээ: user=${userId}, course=${courseId}`);

    /** 1. Давхардал шалгах */
    const existing = await this.certificateRepository.findByUserAndCourse(userId, courseId);
    if (existing) {
      this.logger.debug(`Сертификат аль хэдийн байна: user=${userId}, course=${courseId}`);
      return;
    }

    /** 2. Certificate record үүсгэх (retry 3 удаа давхардлын хувьд) */
    let certificate;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        certificate = await this.certificateRepository.create({
          userId,
          courseId,
          certificateNumber: generateCertificateNumber(),
          verificationCode: generateVerificationCode(),
        });
        break;
      } catch (error: any) {
        if (error.code === 'P2002' && attempt < 2) {
          this.logger.warn(`Давхардал илэрлээ, дахин оролдож байна (${attempt + 1}/3)`);
          continue;
        }
        throw error;
      }
    }

    if (!certificate) {
      this.logger.error(`Сертификат үүсгэж чадсангүй: user=${userId}, course=${courseId}`);
      return;
    }

    /** 3. PDF + QR үүсгэх */
    await this.handleGenerate({
      data: { certificateId: certificate.id },
    } as Job<{ certificateId: string }>);
  }
}
