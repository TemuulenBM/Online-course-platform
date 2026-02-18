import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VerifyCertificateUseCase } from '../../application/use-cases/verify-certificate.use-case';
import { CertificateCacheService } from '../../infrastructure/services/certificate-cache.service';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

describe('VerifyCertificateUseCase', () => {
  let useCase: VerifyCertificateUseCase;
  let certificateCacheService: jest.Mocked<CertificateCacheService>;

  const now = new Date();

  /** Тестэд ашиглах mock сертификат */
  const mockCertificate = new CertificateEntity({
    id: 'cert-1',
    userId: 'user-1',
    courseId: 'course-1',
    certificateNumber: 'OCP-2026-ABCD1234',
    pdfUrl: '/uploads/certificates/cert-1/certificate.pdf',
    qrCodeUrl: '/uploads/certificates/cert-1/qr.png',
    verificationCode: '550e8400e29b41d4a716446655440000',
    issuedAt: now,
    createdAt: now,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    courseTitle: 'Test Course',
    courseSlug: 'test-course',
    courseInstructorId: 'instructor-1',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyCertificateUseCase,
        {
          provide: CertificateCacheService,
          useValue: {
            getByVerificationCode: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<VerifyCertificateUseCase>(VerifyCertificateUseCase);
    certificateCacheService = module.get(CertificateCacheService);
  });

  it('буруу баталгаажуулалтын код → NotFoundException', async () => {
    certificateCacheService.getByVerificationCode.mockResolvedValue(null);

    await expect(useCase.execute('invalid-code')).rejects.toThrow(NotFoundException);
    expect(certificateCacheService.getByVerificationCode).toHaveBeenCalledWith('invalid-code');
  });

  it('зөв баталгаажуулалтын код → сертификат entity буцаах', async () => {
    certificateCacheService.getByVerificationCode.mockResolvedValue(mockCertificate);

    const result = await useCase.execute('550e8400e29b41d4a716446655440000');

    expect(result).toEqual(mockCertificate);
    expect(certificateCacheService.getByVerificationCode).toHaveBeenCalledWith(
      '550e8400e29b41d4a716446655440000',
    );
  });
});
