import { Test, TestingModule } from '@nestjs/testing';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { RedisService } from '../../../../common/redis/redis.service';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

describe('LiveClassesCacheService', () => {
  let service: LiveClassesCacheService;
  let redisService: jest.Mocked<RedisService>;
  let repository: jest.Mocked<LiveSessionRepository>;

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
        LiveClassesCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: LiveSessionRepository,
          useValue: {
            findById: jest.fn(),
            findByLessonId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(LiveClassesCacheService);
    redisService = module.get(RedisService);
    repository = module.get(LiveSessionRepository);
  });

  it('кэшнээс session олдвол DB-рүү хандахгүй', async () => {
    redisService.get.mockResolvedValue(mockSession.toResponse());

    const result = await service.getSession('session-1');
    expect(result).toBeDefined();
    expect(result!.id).toBe('session-1');
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('кэшэнд байхгүй бол DB-ээс авч кэшлэнэ', async () => {
    redisService.get.mockResolvedValue(null);
    repository.findById.mockResolvedValue(mockSession);

    const result = await service.getSession('session-1');
    expect(result).toEqual(mockSession);
    expect(repository.findById).toHaveBeenCalledWith('session-1');
    expect(redisService.set).toHaveBeenCalledWith(
      'live-session:session-1',
      mockSession.toResponse(),
      900,
    );
  });

  it('DB-д ч олдоогүй бол null буцаана', async () => {
    redisService.get.mockResolvedValue(null);
    repository.findById.mockResolvedValue(null);

    const result = await service.getSession('nonexist');
    expect(result).toBeNull();
    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('getSessionByLesson кэшнээс', async () => {
    redisService.get.mockResolvedValue(mockSession.toResponse());

    const result = await service.getSessionByLesson('lesson-1');
    expect(result).toBeDefined();
    expect(repository.findByLessonId).not.toHaveBeenCalled();
  });

  it('getSessionByLesson DB-ээс', async () => {
    redisService.get.mockResolvedValue(null);
    repository.findByLessonId.mockResolvedValue(mockSession);

    const result = await service.getSessionByLesson('lesson-1');
    expect(result).toEqual(mockSession);
    expect(redisService.set).toHaveBeenCalled();
  });

  it('invalidateSession зөв түлхүүрүүдийг устгана', async () => {
    await service.invalidateSession('session-1', 'lesson-1');

    expect(redisService.del).toHaveBeenCalledWith('live-session:session-1');
    expect(redisService.del).toHaveBeenCalledWith('live-session:lesson:lesson-1');
  });
});
