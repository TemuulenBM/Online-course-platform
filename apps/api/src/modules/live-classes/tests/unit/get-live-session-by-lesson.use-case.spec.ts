import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetLiveSessionByLessonUseCase } from '../../application/use-cases/get-live-session-by-lesson.use-case';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

describe('GetLiveSessionByLessonUseCase', () => {
  let useCase: GetLiveSessionByLessonUseCase;
  let cacheService: jest.Mocked<LiveClassesCacheService>;

  const now = new Date();

  const mockSession = new LiveSessionEntity({
    id: 'session-1',
    lessonId: 'lesson-1',
    instructorId: 'instructor-1',
    title: 'Тест',
    description: null,
    scheduledStart: now,
    scheduledEnd: new Date(now.getTime() + 3600000),
    actualStart: null,
    actualEnd: null,
    meetingUrl: null,
    meetingId: null,
    recordingUrl: null,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLiveSessionByLessonUseCase,
        {
          provide: LiveClassesCacheService,
          useValue: { getSessionByLesson: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(GetLiveSessionByLessonUseCase);
    cacheService = module.get(LiveClassesCacheService);
  });

  it('session амжилттай буцаана', async () => {
    cacheService.getSessionByLesson.mockResolvedValue(mockSession);
    const result = await useCase.execute('lesson-1');
    expect(result).toEqual(mockSession);
    expect(cacheService.getSessionByLesson).toHaveBeenCalledWith('lesson-1');
  });

  it('олдоогүй бол NotFoundException', async () => {
    cacheService.getSessionByLesson.mockResolvedValue(null);
    await expect(useCase.execute('non-exist')).rejects.toThrow(NotFoundException);
  });
});
