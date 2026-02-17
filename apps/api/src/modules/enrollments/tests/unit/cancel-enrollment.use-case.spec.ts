import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CancelEnrollmentUseCase } from '../../application/use-cases/cancel-enrollment.use-case';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

describe('CancelEnrollmentUseCase', () => {
  let useCase: CancelEnrollmentUseCase;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
  let enrollmentCacheService: jest.Mocked<EnrollmentCacheService>;

  const now = new Date();

  const mockActiveEnrollment = new EnrollmentEntity({
    id: 'enrollment-id-1',
    userId: 'user-id-1',
    courseId: 'course-id-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const mockCancelledEnrollment = new EnrollmentEntity({
    ...mockActiveEnrollment,
    status: 'cancelled',
  } as any);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelEnrollmentUseCase,
        {
          provide: EnrollmentRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: EnrollmentCacheService,
          useValue: {
            invalidateAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CancelEnrollmentUseCase>(CancelEnrollmentUseCase);
    enrollmentRepository = module.get(EnrollmentRepository);
    enrollmentCacheService = module.get(EnrollmentCacheService);
  });

  it('амжилттай цуцлах', async () => {
    enrollmentRepository.findById.mockResolvedValue(mockActiveEnrollment);
    enrollmentRepository.update.mockResolvedValue(mockCancelledEnrollment);

    const result = await useCase.execute('enrollment-id-1', 'user-id-1', 'STUDENT');

    expect(result.status).toBe('cancelled');
    expect(enrollmentRepository.update).toHaveBeenCalledWith('enrollment-id-1', {
      status: 'cancelled',
    });
    expect(enrollmentCacheService.invalidateAll).toHaveBeenCalled();
  });

  it('элсэлт олдоогүй NotFoundException', async () => {
    enrollmentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'user-id-1', 'STUDENT')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('эрхгүй хэрэглэгч ForbiddenException', async () => {
    enrollmentRepository.findById.mockResolvedValue(mockActiveEnrollment);

    await expect(useCase.execute('enrollment-id-1', 'other-user-id', 'STUDENT')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('идэвхтэй биш элсэлт цуцлахад ConflictException', async () => {
    const completedEnrollment = new EnrollmentEntity({
      ...mockActiveEnrollment,
      status: 'completed',
    } as any);
    enrollmentRepository.findById.mockResolvedValue(completedEnrollment);

    await expect(useCase.execute('enrollment-id-1', 'user-id-1', 'STUDENT')).rejects.toThrow(
      ConflictException,
    );
  });
});
