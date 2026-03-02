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

  it('элссэн — isEnrolled: true, enrollment объект буцаах', async () => {
    enrollmentCacheService.checkEnrollment.mockResolvedValue(mockEnrollment);

    const result = await useCase.execute('user-id-1', 'course-id-1');

    expect(result.isEnrolled).toBe(true);
    expect(result.enrollment).toBeDefined();
    expect(result.enrollment?.id).toBe('enrollment-id-1');
    expect(result.enrollment?.status).toBe('active');
    expect(result.enrollment?.enrolledAt).toBe(now.toISOString());
  });

  it('элсээгүй — isEnrolled: false, enrollment undefined', async () => {
    enrollmentCacheService.checkEnrollment.mockResolvedValue(null);

    const result = await useCase.execute('user-id-1', 'course-id-1');

    expect(result.isEnrolled).toBe(false);
    expect(result.enrollment).toBeUndefined();
  });
});
