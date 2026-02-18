import { Test, TestingModule } from '@nestjs/testing';
import { ListMyCertificatesUseCase } from '../../application/use-cases/list-my-certificates.use-case';
import { CertificateRepository } from '../../infrastructure/repositories/certificate.repository';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

describe('ListMyCertificatesUseCase', () => {
  let useCase: ListMyCertificatesUseCase;
  let certificateRepository: jest.Mocked<CertificateRepository>;

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
    courseTitle: 'Test Course',
    courseSlug: 'test-course',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListMyCertificatesUseCase,
        {
          provide: CertificateRepository,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListMyCertificatesUseCase>(ListMyCertificatesUseCase);
    certificateRepository = module.get(CertificateRepository);
  });

  it('сертификатуудын жагсаалт pagination мэдээлэлтэй буцаах', async () => {
    certificateRepository.findByUserId.mockResolvedValue({
      data: [mockCertificate],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(certificateRepository.findByUserId).toHaveBeenCalledWith('user-1', {
      page: 1,
      limit: 20,
    });
  });

  it('хоосон жагсаалт буцаах', async () => {
    certificateRepository.findByUserId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
