import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ListCourseCertificatesUseCase } from '../../application/use-cases/list-course-certificates.use-case';
import { CertificateRepository } from '../../infrastructure/repositories/certificate.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { CertificateEntity } from '../../domain/entities/certificate.entity';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';

describe('ListCourseCertificatesUseCase', () => {
  let useCase: ListCourseCertificatesUseCase;
  let certificateRepository: jest.Mocked<CertificateRepository>;
  let courseRepository: jest.Mocked<CourseRepository>;

  const now = new Date();

  /** Тестэд ашиглах mock сургалт */
  const mockCourse = new CourseEntity({
    id: 'course-1',
    title: 'Test Course',
    slug: 'test-course',
    description: 'Тайлбар',
    instructorId: 'instructor-1',
    categoryId: 'cat-1',
    price: null,
    discountPrice: null,
    difficulty: 'beginner',
    language: 'mn',
    status: 'published',
    thumbnailUrl: null,
    durationMinutes: 0,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  });

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
        ListCourseCertificatesUseCase,
        {
          provide: CertificateRepository,
          useValue: {
            findByCourseId: jest.fn(),
          },
        },
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListCourseCertificatesUseCase>(ListCourseCertificatesUseCase);
    certificateRepository = module.get(CertificateRepository);
    courseRepository = module.get(CourseRepository);
  });

  it('сургалт олдоогүй үед NotFoundException', async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', 'TEACHER', 'nonexistent', {
        page: 1,
        limit: 20,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('эрхгүй хэрэглэгч (STUDENT) ForbiddenException', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);

    await expect(
      useCase.execute('student-1', 'STUDENT', 'course-1', {
        page: 1,
        limit: 20,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('сургалтын эзэмшигч амжилттай жагсаалт авах', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    certificateRepository.findByCourseId.mockResolvedValue({
      data: [mockCertificate],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('instructor-1', 'TEACHER', 'course-1', {
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(certificateRepository.findByCourseId).toHaveBeenCalledWith('course-1', {
      page: 1,
      limit: 20,
    });
  });

  it('ADMIN амжилттай жагсаалт авах', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    certificateRepository.findByCourseId.mockResolvedValue({
      data: [mockCertificate],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('admin-user-1', 'ADMIN', 'course-1', {
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});
