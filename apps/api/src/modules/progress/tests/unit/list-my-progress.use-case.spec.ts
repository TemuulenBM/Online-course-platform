import { Test, TestingModule } from '@nestjs/testing';
import { ListMyProgressUseCase } from '../../application/use-cases/list-my-progress.use-case';
import { ProgressRepository } from '../../infrastructure/repositories/progress.repository';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';

describe('ListMyProgressUseCase', () => {
  let useCase: ListMyProgressUseCase;
  let progressRepository: jest.Mocked<ProgressRepository>;

  const now = new Date();

  /** Тестэд ашиглах mock ахиц */
  const mockProgress = new UserProgressEntity({
    id: 'progress-id-1',
    userId: 'user-id-1',
    lessonId: 'lesson-id-1',
    progressPercentage: 50,
    completed: false,
    timeSpentSeconds: 300,
    lastPositionSeconds: 150,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    lessonTitle: 'Хичээл 1',
    lessonType: 'video',
    courseId: 'course-id-1',
    lessonOrderIndex: 0,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListMyProgressUseCase,
        {
          provide: ProgressRepository,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListMyProgressUseCase>(ListMyProgressUseCase);
    progressRepository = module.get(ProgressRepository);
  });

  it('ахицуудын жагсаалт авах', async () => {
    progressRepository.findByUserId.mockResolvedValue({
      data: [mockProgress],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-id-1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    /** toResponse() дуудагдсан эсэх шалгах */
    expect(result.data[0]).toHaveProperty('id', 'progress-id-1');
    expect(result.data[0]).toHaveProperty('lessonTitle', 'Хичээл 1');
    expect(progressRepository.findByUserId).toHaveBeenCalledWith('user-id-1', {
      page: 1,
      limit: 20,
    });
  });

  it('хоосон жагсаалт', async () => {
    progressRepository.findByUserId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-id-1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
