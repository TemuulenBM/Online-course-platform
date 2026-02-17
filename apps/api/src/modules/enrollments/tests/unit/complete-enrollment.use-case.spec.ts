import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CompleteEnrollmentUseCase } from '../../application/use-cases/complete-enrollment.use-case';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

describe('CompleteEnrollmentUseCase', () => {
  let useCase: CompleteEnrollmentUseCase;
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

  const mockCompletedEnrollment = new EnrollmentEntity({
    ...mockActiveEnrollment,
    status: 'completed',
    completedAt: now,
  } as any);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteEnrollmentUseCase,
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

    useCase = module.get<CompleteEnrollmentUseCase>(CompleteEnrollmentUseCase);
    enrollmentRepository = module.get(EnrollmentRepository);
    enrollmentCacheService = module.get(EnrollmentCacheService);
  });

  it('амжилттай дуусгах', async () => {
    enrollmentRepository.findById.mockResolvedValue(mockActiveEnrollment);
    enrollmentRepository.update.mockResolvedValue(mockCompletedEnrollment);

    const result = await useCase.execute('enrollment-id-1');

    expect(result.status).toBe('completed');
    expect(enrollmentRepository.update).toHaveBeenCalledWith('enrollment-id-1', {
      status: 'completed',
      completedAt: expect.any(Date),
    });
    expect(enrollmentCacheService.invalidateAll).toHaveBeenCalled();
  });

  it('элсэлт олдоогүй NotFoundException', async () => {
    enrollmentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('идэвхтэй биш элсэлт дуусгахад ConflictException', async () => {
    const cancelledEnrollment = new EnrollmentEntity({
      ...mockActiveEnrollment,
      status: 'cancelled',
    } as any);
    enrollmentRepository.findById.mockResolvedValue(cancelledEnrollment);

    await expect(useCase.execute('enrollment-id-1')).rejects.toThrow(ConflictException);
  });
});
