import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetEnrollmentUseCase } from '../../application/use-cases/get-enrollment.use-case';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

describe('GetEnrollmentUseCase', () => {
  let useCase: GetEnrollmentUseCase;
  let enrollmentCacheService: jest.Mocked<EnrollmentCacheService>;

  const now = new Date();

  const mockEnrollment = new EnrollmentEntity({
    id: 'enrollment-id-1',
    userId: 'user-id-1',
    courseId: 'course-id-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    courseInstructorId: 'instructor-id-1',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEnrollmentUseCase,
        {
          provide: EnrollmentCacheService,
          useValue: {
            getEnrollment: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetEnrollmentUseCase>(GetEnrollmentUseCase);
    enrollmentCacheService = module.get(EnrollmentCacheService);
  });

  it('өөрийн элсэлт амжилттай авах', async () => {
    enrollmentCacheService.getEnrollment.mockResolvedValue(mockEnrollment);

    const result = await useCase.execute('enrollment-id-1', 'user-id-1', 'STUDENT');

    expect(result).toEqual(mockEnrollment);
  });

  it('элсэлт олдоогүй NotFoundException', async () => {
    enrollmentCacheService.getEnrollment.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'user-id-1', 'STUDENT')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('эрхгүй хэрэглэгч ForbiddenException', async () => {
    enrollmentCacheService.getEnrollment.mockResolvedValue(mockEnrollment);

    await expect(useCase.execute('enrollment-id-1', 'other-user-id', 'STUDENT')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
