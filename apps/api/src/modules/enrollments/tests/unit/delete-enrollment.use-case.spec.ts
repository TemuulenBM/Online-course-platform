import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteEnrollmentUseCase } from '../../application/use-cases/delete-enrollment.use-case';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

describe('DeleteEnrollmentUseCase', () => {
  let useCase: DeleteEnrollmentUseCase;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
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
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteEnrollmentUseCase,
        {
          provide: EnrollmentRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
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

    useCase = module.get<DeleteEnrollmentUseCase>(DeleteEnrollmentUseCase);
    enrollmentRepository = module.get(EnrollmentRepository);
    enrollmentCacheService = module.get(EnrollmentCacheService);
  });

  it('амжилттай устгах', async () => {
    enrollmentRepository.findById.mockResolvedValue(mockEnrollment);
    enrollmentRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('enrollment-id-1');

    expect(enrollmentRepository.delete).toHaveBeenCalledWith('enrollment-id-1');
    expect(enrollmentCacheService.invalidateAll).toHaveBeenCalledWith(
      'enrollment-id-1',
      'user-id-1',
      'course-id-1',
    );
  });

  it('элсэлт олдоогүй NotFoundException', async () => {
    enrollmentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
  });
});
