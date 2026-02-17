import { Test, TestingModule } from '@nestjs/testing';
import { ListMyEnrollmentsUseCase } from '../../application/use-cases/list-my-enrollments.use-case';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

describe('ListMyEnrollmentsUseCase', () => {
  let useCase: ListMyEnrollmentsUseCase;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;

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
    courseTitle: 'TypeScript Сургалт',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListMyEnrollmentsUseCase,
        {
          provide: EnrollmentRepository,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListMyEnrollmentsUseCase>(ListMyEnrollmentsUseCase);
    enrollmentRepository = module.get(EnrollmentRepository);
  });

  it('элсэлтүүдийн жагсаалт pagination-тэй авах', async () => {
    enrollmentRepository.findByUserId.mockResolvedValue({
      data: [mockEnrollment],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-id-1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(result.meta.totalPages).toBe(1);
    expect(enrollmentRepository.findByUserId).toHaveBeenCalledWith('user-id-1', {
      page: 1,
      limit: 20,
      status: undefined,
    });
  });

  it('статусаар шүүх', async () => {
    enrollmentRepository.findByUserId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-id-1', { page: 1, limit: 20, status: 'completed' });

    expect(result.data).toHaveLength(0);
    expect(enrollmentRepository.findByUserId).toHaveBeenCalledWith('user-id-1', {
      page: 1,
      limit: 20,
      status: 'completed',
    });
  });

  it('хоосон жагсаалт', async () => {
    enrollmentRepository.findByUserId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-id-1', {});

    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
    expect(result.meta.totalPages).toBe(0);
  });
});
