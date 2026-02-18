import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetCertificateUseCase } from '../../application/use-cases/get-certificate.use-case';
import { CertificateCacheService } from '../../infrastructure/services/certificate-cache.service';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

describe('GetCertificateUseCase', () => {
  let useCase: GetCertificateUseCase;
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
        GetCertificateUseCase,
        {
          provide: CertificateCacheService,
          useValue: {
            getCertificate: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetCertificateUseCase>(GetCertificateUseCase);
    certificateCacheService = module.get(CertificateCacheService);
  });

  it('сертификат олдоогүй үед NotFoundException', async () => {
    certificateCacheService.getCertificate.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'user-1', 'STUDENT')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('эрхгүй хэрэглэгч ForbiddenException', async () => {
    certificateCacheService.getCertificate.mockResolvedValue(mockCertificate);

    await expect(useCase.execute('cert-1', 'other-user-1', 'STUDENT')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('сертификатын эзэмшигч амжилттай авах', async () => {
    certificateCacheService.getCertificate.mockResolvedValue(mockCertificate);

    const result = await useCase.execute('cert-1', 'user-1', 'STUDENT');

    expect(result).toEqual(mockCertificate);
    expect(certificateCacheService.getCertificate).toHaveBeenCalledWith('cert-1');
  });

  it('ADMIN амжилттай авах', async () => {
    certificateCacheService.getCertificate.mockResolvedValue(mockCertificate);

    const result = await useCase.execute('cert-1', 'admin-user-1', 'ADMIN');

    expect(result).toEqual(mockCertificate);
  });

  it('сургалтын багш амжилттай авах', async () => {
    certificateCacheService.getCertificate.mockResolvedValue(mockCertificate);

    /** instructor-1 нь courseInstructorId-тэй таарна */
    const result = await useCase.execute('cert-1', 'instructor-1', 'TEACHER');

    expect(result).toEqual(mockCertificate);
  });
});
