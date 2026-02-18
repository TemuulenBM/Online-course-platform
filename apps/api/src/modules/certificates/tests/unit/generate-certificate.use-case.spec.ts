import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { GenerateCertificateUseCase } from '../../application/use-cases/generate-certificate.use-case';
import { CertificateRepository } from '../../infrastructure/repositories/certificate.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { CertificateEntity } from '../../domain/entities/certificate.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';

describe('GenerateCertificateUseCase', () => {
  let useCase: GenerateCertificateUseCase;
  let certificateRepository: jest.Mocked<CertificateRepository>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
  let queue: { add: jest.Mock };

  const now = new Date();

  /** Тестэд ашиглах mock сертификат */
  const mockCertificate = new CertificateEntity({
    id: 'cert-1',
    userId: 'user-1',
    courseId: 'course-1',
    certificateNumber: 'OCP-2026-ABCD1234',
    pdfUrl: null,
    qrCodeUrl: null,
    verificationCode: '550e8400e29b41d4a716446655440000',
    issuedAt: now,
    createdAt: now,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    courseTitle: 'Test Course',
    courseSlug: 'test-course',
    courseInstructorId: 'instructor-1',
  });

  /** Тестэд ашиглах mock элсэлт (COMPLETED) */
  const mockCompletedEnrollment = new EnrollmentEntity({
    id: 'enrollment-1',
    userId: 'user-1',
    courseId: 'course-1',
    status: 'completed',
    enrolledAt: now,
    expiresAt: null,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock элсэлт (ACTIVE — дуусаагүй) */
  const mockActiveEnrollment = new EnrollmentEntity({
    id: 'enrollment-1',
    userId: 'user-1',
    courseId: 'course-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    queue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateCertificateUseCase,
        {
          provide: CertificateRepository,
          useValue: {
            create: jest.fn(),
            findByUserAndCourse: jest.fn(),
          },
        },
        {
          provide: EnrollmentRepository,
          useValue: {
            findByUserAndCourse: jest.fn(),
          },
        },
        {
          provide: getQueueToken('certificates'),
          useValue: queue,
        },
      ],
    }).compile();

    useCase = module.get<GenerateCertificateUseCase>(GenerateCertificateUseCase);
    certificateRepository = module.get(CertificateRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
  });

  it('элсэлт олдоогүй үед NotFoundException', async () => {
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'course-1')).rejects.toThrow(NotFoundException);
    expect(enrollmentRepository.findByUserAndCourse).toHaveBeenCalledWith('user-1', 'course-1');
  });

  it('элсэлт COMPLETED биш үед BadRequestException', async () => {
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockActiveEnrollment);

    await expect(useCase.execute('user-1', 'course-1')).rejects.toThrow(BadRequestException);
  });

  it('аль хэдийн сертификат байгаа үед ConflictException', async () => {
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockCompletedEnrollment);
    certificateRepository.findByUserAndCourse.mockResolvedValue(mockCertificate);

    await expect(useCase.execute('user-1', 'course-1')).rejects.toThrow(ConflictException);
  });

  it('амжилттай сертификат үүсгэж queue.add дуудах', async () => {
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockCompletedEnrollment);
    certificateRepository.findByUserAndCourse.mockResolvedValue(null);
    certificateRepository.create.mockResolvedValue(mockCertificate);

    const result = await useCase.execute('user-1', 'course-1');

    expect(result).toEqual(mockCertificate);
    expect(certificateRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        courseId: 'course-1',
        certificateNumber: expect.any(String),
        verificationCode: expect.any(String),
      }),
    );
    expect(queue.add).toHaveBeenCalledWith('generate', {
      certificateId: 'cert-1',
    });
  });

  it('certificate number давхардал (P2002) → retry хийж амжилттай үүсгэх', async () => {
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockCompletedEnrollment);
    certificateRepository.findByUserAndCourse.mockResolvedValue(null);

    /** Эхний удаад P2002 алдаа, дараагийн удаад амжилттай */
    const p2002Error = new Error('Unique constraint failed');
    (p2002Error as any).code = 'P2002';
    certificateRepository.create
      .mockRejectedValueOnce(p2002Error)
      .mockResolvedValueOnce(mockCertificate);

    const result = await useCase.execute('user-1', 'course-1');

    expect(result).toEqual(mockCertificate);
    expect(certificateRepository.create).toHaveBeenCalledTimes(2);
    expect(queue.add).toHaveBeenCalledWith('generate', {
      certificateId: 'cert-1',
    });
  });
});
