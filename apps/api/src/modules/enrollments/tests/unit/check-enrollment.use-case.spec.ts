import { Test, TestingModule } from '@nestjs/testing';
import { CheckEnrollmentUseCase } from '../../application/use-cases/check-enrollment.use-case';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

describe('CheckEnrollmentUseCase', () => {
  let useCase: CheckEnrollmentUseCase;
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
        CheckEnrollmentUseCase,
        {
          provide: EnrollmentCacheService,
          useValue: {
            checkEnrollment: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CheckEnrollmentUseCase>(CheckEnrollmentUseCase);
    enrollmentCacheService = module.get(EnrollmentCacheService);
  });

  it('элссэн — enrolled: true, status буцаах', async () => {
    enrollmentCacheService.checkEnrollment.mockResolvedValue(mockEnrollment);

    const result = await useCase.execute('user-id-1', 'course-id-1');

    expect(result.enrolled).toBe(true);
    expect(result.status).toBe('active');
    expect(result.enrollmentId).toBe('enrollment-id-1');
    expect(result.enrolledAt).toEqual(now);
  });

  it('элсээгүй — enrolled: false', async () => {
    enrollmentCacheService.checkEnrollment.mockResolvedValue(null);

    const result = await useCase.execute('user-id-1', 'course-id-1');

    expect(result.enrolled).toBe(false);
    expect(result.status).toBeNull();
    expect(result.enrollmentId).toBeNull();
    expect(result.enrolledAt).toBeNull();
  });
});
