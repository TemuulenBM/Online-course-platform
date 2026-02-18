import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CertificateProcessor } from '../../infrastructure/services/certificate.processor';
import { CertificateRepository } from '../../infrastructure/repositories/certificate.repository';
import { CertificateCacheService } from '../../infrastructure/services/certificate-cache.service';
import { PdfGeneratorService } from '../../infrastructure/services/pdf-generator.service';
import { QrCodeService } from '../../infrastructure/services/qr-code.service';
import { STORAGE_SERVICE } from '../../../content/infrastructure/services/storage/storage.interface';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

describe('CertificateProcessor', () => {
  let processor: CertificateProcessor;
  let certificateRepository: jest.Mocked<CertificateRepository>;
  let certificateCacheService: jest.Mocked<CertificateCacheService>;
  let pdfGeneratorService: jest.Mocked<PdfGeneratorService>;
  let qrCodeService: jest.Mocked<QrCodeService>;
  let storageService: { upload: jest.Mock; delete: jest.Mock };
  let configService: jest.Mocked<ConfigService>;

  /** Тестэд ашиглах mock сертификат entity */
  const mockCertificate = new CertificateEntity({
    id: 'cert-1',
    userId: 'user-1',
    courseId: 'course-1',
    certificateNumber: 'OCP-2026-ABCD1234',
    pdfUrl: null,
    qrCodeUrl: null,
    verificationCode: '550e8400e29b41d4a716446655440000',
    issuedAt: new Date('2026-01-01'),
    createdAt: new Date('2026-01-01'),
    userName: 'John Doe',
    userEmail: 'john@example.com',
    courseTitle: 'Test Course',
    courseSlug: 'test-course',
    courseInstructorId: 'instructor-1',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateProcessor,
        {
          provide: CertificateRepository,
          useValue: {
            findById: jest.fn(),
            findByUserAndCourse: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CertificateCacheService,
          useValue: {
            invalidateAll: jest.fn(),
          },
        },
        {
          provide: PdfGeneratorService,
          useValue: {
            generateCertificatePdf: jest.fn(),
          },
        },
        {
          provide: QrCodeService,
          useValue: {
            generateQrCodeBuffer: jest.fn(),
            generateQrCodeDataUrl: jest.fn(),
          },
        },
        {
          provide: STORAGE_SERVICE,
          useValue: {
            upload: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3001'),
          },
        },
      ],
    }).compile();

    processor = module.get<CertificateProcessor>(CertificateProcessor);
    certificateRepository = module.get(CertificateRepository);
    certificateCacheService = module.get(CertificateCacheService);
    pdfGeneratorService = module.get(PdfGeneratorService);
    qrCodeService = module.get(QrCodeService);
    storageService = module.get(STORAGE_SERVICE);
    configService = module.get(ConfigService);
  });

  describe('handleGenerate', () => {
    it('Сертификат олдоогүй бол early return хийх', async () => {
      certificateRepository.findById.mockResolvedValue(null);

      await processor.handleGenerate({
        data: { certificateId: 'nonexistent' },
      } as any);

      expect(certificateRepository.findById).toHaveBeenCalledWith('nonexistent');
      /** QR, PDF, storage, update дуудагдаагүй байх */
      expect(qrCodeService.generateQrCodeBuffer).not.toHaveBeenCalled();
      expect(pdfGeneratorService.generateCertificatePdf).not.toHaveBeenCalled();
      expect(storageService.upload).not.toHaveBeenCalled();
      expect(certificateRepository.update).not.toHaveBeenCalled();
    });

    it('Амжилттай үүсгэлт — QR, PDF generate, storage upload x2, DB update, cache invalidate', async () => {
      /** Mock хариултуудыг бэлдэх */
      certificateRepository.findById.mockResolvedValue(mockCertificate);
      qrCodeService.generateQrCodeBuffer.mockResolvedValue(Buffer.from('qr-png'));
      qrCodeService.generateQrCodeDataUrl.mockResolvedValue('data:image/png;base64,qrDataUrl');
      storageService.upload
        .mockResolvedValueOnce({
          url: '/uploads/certificates/cert-1/qr.png',
          sizeBytes: 100,
        })
        .mockResolvedValueOnce({
          url: '/uploads/certificates/cert-1/certificate.pdf',
          sizeBytes: 5000,
        });
      pdfGeneratorService.generateCertificatePdf.mockResolvedValue(Buffer.from('pdf-content'));
      certificateRepository.update.mockResolvedValue(mockCertificate);
      certificateCacheService.invalidateAll.mockResolvedValue(undefined);

      await processor.handleGenerate({
        data: { certificateId: 'cert-1' },
      } as any);

      /** 1. Сертификат DB-ээс авсан */
      expect(certificateRepository.findById).toHaveBeenCalledWith('cert-1');

      /** 2. QR код үүсгэсэн (buffer + dataUrl) */
      expect(qrCodeService.generateQrCodeBuffer).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/certificates/verify/'),
      );
      expect(qrCodeService.generateQrCodeDataUrl).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/certificates/verify/'),
      );

      /** 3. Storage-д 2 удаа upload хийсэн (QR + PDF) */
      expect(storageService.upload).toHaveBeenCalledTimes(2);

      /** 4. PDF генератор дуудагдсан */
      expect(pdfGeneratorService.generateCertificatePdf).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: 'John Doe',
          courseTitle: 'Test Course',
          certificateNumber: 'OCP-2026-ABCD1234',
          qrCodeDataUrl: 'data:image/png;base64,qrDataUrl',
        }),
      );

      /** 5. DB-д pdfUrl, qrCodeUrl шинэчлэгдсэн */
      expect(certificateRepository.update).toHaveBeenCalledWith('cert-1', {
        pdfUrl: '/uploads/certificates/cert-1/certificate.pdf',
        qrCodeUrl: '/uploads/certificates/cert-1/qr.png',
      });

      /** 6. Кэш invalidate хийгдсэн */
      expect(certificateCacheService.invalidateAll).toHaveBeenCalledWith(
        'cert-1',
        '550e8400e29b41d4a716446655440000',
      );
    });
  });

  describe('handleAutoGenerate', () => {
    it('Аль хэдийн сертификат байгаа бол early return (skip)', async () => {
      certificateRepository.findByUserAndCourse.mockResolvedValue(mockCertificate);

      await processor.handleAutoGenerate({
        data: { userId: 'user-1', courseId: 'course-1' },
      } as any);

      expect(certificateRepository.findByUserAndCourse).toHaveBeenCalledWith('user-1', 'course-1');
      /** create дуудагдаагүй байх */
      expect(certificateRepository.create).not.toHaveBeenCalled();
    });

    it('Амжилттай auto-generate — create + handleGenerate процесс', async () => {
      /** findByUserAndCourse: давхардал байхгүй */
      certificateRepository.findByUserAndCourse.mockResolvedValue(null);
      /** create: шинэ сертификат буцаах */
      certificateRepository.create.mockResolvedValue(mockCertificate);
      /** handleGenerate-ын mock-ууд (findById дахин дуудагдана) */
      certificateRepository.findById.mockResolvedValue(mockCertificate);
      qrCodeService.generateQrCodeBuffer.mockResolvedValue(Buffer.from('qr-png'));
      qrCodeService.generateQrCodeDataUrl.mockResolvedValue('data:image/png;base64,qrDataUrl');
      storageService.upload
        .mockResolvedValueOnce({
          url: '/uploads/certificates/cert-1/qr.png',
          sizeBytes: 100,
        })
        .mockResolvedValueOnce({
          url: '/uploads/certificates/cert-1/certificate.pdf',
          sizeBytes: 5000,
        });
      pdfGeneratorService.generateCertificatePdf.mockResolvedValue(Buffer.from('pdf-content'));
      certificateRepository.update.mockResolvedValue(mockCertificate);
      certificateCacheService.invalidateAll.mockResolvedValue(undefined);

      await processor.handleAutoGenerate({
        data: { userId: 'user-1', courseId: 'course-1' },
      } as any);

      /** Давхардал шалгасан */
      expect(certificateRepository.findByUserAndCourse).toHaveBeenCalledWith('user-1', 'course-1');

      /** Сертификат record үүсгэсэн */
      expect(certificateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          courseId: 'course-1',
          certificateNumber: expect.any(String),
          verificationCode: expect.any(String),
        }),
      );

      /** handleGenerate процесс ажилласан (findById дуудагдсан) */
      expect(certificateRepository.findById).toHaveBeenCalledWith('cert-1');
      expect(qrCodeService.generateQrCodeBuffer).toHaveBeenCalled();
      expect(pdfGeneratorService.generateCertificatePdf).toHaveBeenCalled();
      expect(storageService.upload).toHaveBeenCalledTimes(2);
      expect(certificateRepository.update).toHaveBeenCalled();
      expect(certificateCacheService.invalidateAll).toHaveBeenCalled();
    });
  });
});
