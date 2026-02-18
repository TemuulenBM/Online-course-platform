import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteCertificateUseCase } from '../../application/use-cases/delete-certificate.use-case';
import { CertificateRepository } from '../../infrastructure/repositories/certificate.repository';
import { CertificateCacheService } from '../../infrastructure/services/certificate-cache.service';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

describe('DeleteCertificateUseCase', () => {
  let useCase: DeleteCertificateUseCase;
  let certificateRepository: jest.Mocked<CertificateRepository>;
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
        DeleteCertificateUseCase,
        {
          provide: CertificateRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CertificateCacheService,
          useValue: {
            invalidateAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteCertificateUseCase>(DeleteCertificateUseCase);
    certificateRepository = module.get(CertificateRepository);
    certificateCacheService = module.get(CertificateCacheService);
  });

  it('сертификат олдоогүй үед NotFoundException', async () => {
    certificateRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('амжилттай устгаж кэш invalidate хийх', async () => {
    certificateRepository.findById.mockResolvedValue(mockCertificate);
    certificateRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('cert-1');

    expect(certificateRepository.delete).toHaveBeenCalledWith('cert-1');
    expect(certificateCacheService.invalidateAll).toHaveBeenCalledWith(
      'cert-1',
      '550e8400e29b41d4a716446655440000',
    );
  });
});
