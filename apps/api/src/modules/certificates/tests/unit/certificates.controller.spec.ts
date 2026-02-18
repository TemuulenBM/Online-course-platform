import { Test, TestingModule } from '@nestjs/testing';
import { CertificatesController } from '../../interface/controllers/certificates.controller';
import { GenerateCertificateUseCase } from '../../application/use-cases/generate-certificate.use-case';
import { ListMyCertificatesUseCase } from '../../application/use-cases/list-my-certificates.use-case';
import { ListCourseCertificatesUseCase } from '../../application/use-cases/list-course-certificates.use-case';
import { GetCertificateUseCase } from '../../application/use-cases/get-certificate.use-case';
import { VerifyCertificateUseCase } from '../../application/use-cases/verify-certificate.use-case';
import { DeleteCertificateUseCase } from '../../application/use-cases/delete-certificate.use-case';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

describe('CertificatesController', () => {
  let controller: CertificatesController;
  let generateCertificateUseCase: jest.Mocked<GenerateCertificateUseCase>;
  let listMyCertificatesUseCase: jest.Mocked<ListMyCertificatesUseCase>;
  let listCourseCertificatesUseCase: jest.Mocked<ListCourseCertificatesUseCase>;
  let getCertificateUseCase: jest.Mocked<GetCertificateUseCase>;
  let verifyCertificateUseCase: jest.Mocked<VerifyCertificateUseCase>;
  let deleteCertificateUseCase: jest.Mocked<DeleteCertificateUseCase>;

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
      controllers: [CertificatesController],
      providers: [
        {
          provide: GenerateCertificateUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListMyCertificatesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListCourseCertificatesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetCertificateUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: VerifyCertificateUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteCertificateUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<CertificatesController>(CertificatesController);
    generateCertificateUseCase = module.get(GenerateCertificateUseCase);
    listMyCertificatesUseCase = module.get(ListMyCertificatesUseCase);
    listCourseCertificatesUseCase = module.get(ListCourseCertificatesUseCase);
    getCertificateUseCase = module.get(GetCertificateUseCase);
    verifyCertificateUseCase = module.get(VerifyCertificateUseCase);
    deleteCertificateUseCase = module.get(DeleteCertificateUseCase);
  });

  it('GET /certificates/verify/:verificationCode — Сертификат баталгаажуулах use case дуудагдаж toResponse() буцаах', async () => {
    verifyCertificateUseCase.execute.mockResolvedValue(mockCertificate);

    const result = await controller.verifyCertificate('550e8400e29b41d4a716446655440000');

    expect(result).toEqual(mockCertificate.toResponse());
    expect(verifyCertificateUseCase.execute).toHaveBeenCalledWith(
      '550e8400e29b41d4a716446655440000',
    );
  });

  it('GET /certificates/my — Миний сертификатуудын жагсаалт pagination хэлбэрээр буцаах', async () => {
    const mockResult = {
      data: [mockCertificate],
      total: 1,
      page: 1,
      limit: 20,
    };
    listMyCertificatesUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.listMyCertificates('user-1', {
      page: 1,
      limit: 20,
    });

    expect(result).toEqual({
      data: [mockCertificate.toResponse()],
      total: 1,
      page: 1,
      limit: 20,
    });
    expect(listMyCertificatesUseCase.execute).toHaveBeenCalledWith('user-1', {
      page: 1,
      limit: 20,
    });
  });

  it('GET /certificates/course/:courseId — userId, userRole, courseId зөв дамжуулагдах', async () => {
    const mockResult = {
      data: [mockCertificate],
      total: 1,
      page: 1,
      limit: 20,
    };
    listCourseCertificatesUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.listCourseCertificates('user-1', 'TEACHER', 'course-1', {
      page: 1,
      limit: 20,
    });

    expect(result).toEqual({
      data: [mockCertificate.toResponse()],
      total: 1,
      page: 1,
      limit: 20,
    });
    expect(listCourseCertificatesUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'TEACHER',
      'course-1',
      { page: 1, limit: 20 },
    );
  });

  it('POST /certificates/generate/:courseId — userId, courseId дамжуулж toResponse() буцаах', async () => {
    generateCertificateUseCase.execute.mockResolvedValue(mockCertificate);

    const result = await controller.generateCertificate('user-1', 'course-1');

    expect(result).toEqual(mockCertificate.toResponse());
    expect(generateCertificateUseCase.execute).toHaveBeenCalledWith('user-1', 'course-1');
  });

  it('GET /certificates/:id — id, userId, userRole зөв дамжуулагдах', async () => {
    getCertificateUseCase.execute.mockResolvedValue(mockCertificate);

    const result = await controller.getCertificate('cert-1', 'user-1', 'STUDENT');

    expect(result).toEqual(mockCertificate.toResponse());
    expect(getCertificateUseCase.execute).toHaveBeenCalledWith('cert-1', 'user-1', 'STUDENT');
  });

  it('DELETE /certificates/:id — Устгаад message буцаах', async () => {
    deleteCertificateUseCase.execute.mockResolvedValue(undefined);

    const result = await controller.deleteCertificate('cert-1');

    expect(result).toEqual({ message: 'Сертификат амжилттай устгагдлаа' });
    expect(deleteCertificateUseCase.execute).toHaveBeenCalledWith('cert-1');
  });
});
