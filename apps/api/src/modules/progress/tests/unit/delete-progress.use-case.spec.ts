import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteProgressUseCase } from '../../application/use-cases/delete-progress.use-case';
import { ProgressRepository } from '../../infrastructure/repositories/progress.repository';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';

describe('DeleteProgressUseCase', () => {
  let useCase: DeleteProgressUseCase;
  let progressRepository: jest.Mocked<ProgressRepository>;
  let progressCacheService: jest.Mocked<ProgressCacheService>;

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
        DeleteProgressUseCase,
        {
          provide: ProgressRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ProgressCacheService,
          useValue: {
            invalidateAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteProgressUseCase>(DeleteProgressUseCase);
    progressRepository = module.get(ProgressRepository);
    progressCacheService = module.get(ProgressCacheService);
  });

  it('амжилттай ахиц устгах', async () => {
    progressRepository.findById.mockResolvedValue(mockProgress);
    progressRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('progress-id-1');

    expect(progressRepository.delete).toHaveBeenCalledWith('progress-id-1');
    expect(progressCacheService.invalidateAll).toHaveBeenCalledWith(
      'user-id-1',
      'lesson-id-1',
      'course-id-1',
    );
  });

  it('олдсонгүй — NotFoundException', async () => {
    progressRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
  });
});
