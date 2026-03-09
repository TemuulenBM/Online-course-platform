import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { CleanupStaleLiveSessionsUseCase } from '../../application/use-cases/cleanup-stale-live-sessions.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

describe('CleanupStaleLiveSessionsUseCase', () => {
  let useCase: CleanupStaleLiveSessionsUseCase;
  let repository: jest.Mocked<LiveSessionRepository>;
  let cacheService: jest.Mocked<LiveClassesCacheService>;
  let mockQueue: { add: jest.Mock };

  const now = new Date();
  const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

  /** 5 цагийн өмнө эхэлсэн stale session */
  const mockStaleSession = new LiveSessionEntity({
    id: 'stale-session-1',
    lessonId: 'lesson-1',
    instructorId: 'instructor-1',
    title: 'Хуучин шууд хичээл',
    description: null,
    scheduledStart: fiveHoursAgo,
    scheduledEnd: new Date(fiveHoursAgo.getTime() + 3600000),
    actualStart: fiveHoursAgo,
    actualEnd: null,
    meetingUrl: 'ocp-live-stale-session-1',
    meetingId: 'ocp-live-stale-session-1',
    recordingUrl: null,
    status: 'live',
    createdAt: fiveHoursAgo,
    updatedAt: fiveHoursAgo,
    courseId: 'course-1',
  });

  const mockStaleSession2 = new LiveSessionEntity({
    ...mockStaleSession,
    id: 'stale-session-2',
    lessonId: 'lesson-2',
    title: 'Хуучин шууд хичээл 2',
    courseId: 'course-2',
  });

  const mockEndedSession = new LiveSessionEntity({
    ...mockStaleSession,
    status: 'ended',
    actualEnd: now,
  });

  beforeEach(async () => {
    mockQueue = { add: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CleanupStaleLiveSessionsUseCase,
        {
          provide: LiveSessionRepository,
          useValue: {
            findStaleLiveSessions: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: LiveClassesCacheService,
          useValue: { invalidateSession: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: getQueueToken('live-classes'), useValue: mockQueue },
      ],
    }).compile();

    useCase = module.get(CleanupStaleLiveSessionsUseCase);
    repository = module.get(LiveSessionRepository);
    cacheService = module.get(LiveClassesCacheService);
  });

  it('stale session олдоогүй бол 0 буцаана', async () => {
    repository.findStaleLiveSessions.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toBe(0);
    expect(repository.update).not.toHaveBeenCalled();
    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it('1 stale session олдвол ENDED болгоно', async () => {
    repository.findStaleLiveSessions.mockResolvedValue([mockStaleSession]);
    repository.update.mockResolvedValue(mockEndedSession);

    const result = await useCase.execute();

    expect(result).toBe(1);
    expect(repository.update).toHaveBeenCalledWith('stale-session-1', {
      status: 'ENDED',
      actualEnd: expect.any(Date),
    });
    expect(cacheService.invalidateSession).toHaveBeenCalledWith('stale-session-1', 'lesson-1');
    expect(mockQueue.add).toHaveBeenCalledWith('session-ended', {
      sessionId: 'stale-session-1',
      courseId: 'course-1',
    });
  });

  it('олон stale session олдвол бүгдийг цэвэрлэнэ', async () => {
    repository.findStaleLiveSessions.mockResolvedValue([mockStaleSession, mockStaleSession2]);
    repository.update.mockResolvedValue(mockEndedSession);

    const result = await useCase.execute();

    expect(result).toBe(2);
    expect(repository.update).toHaveBeenCalledTimes(2);
    expect(cacheService.invalidateSession).toHaveBeenCalledTimes(2);
    expect(mockQueue.add).toHaveBeenCalledTimes(2);
  });

  it('нэг session алдаа гарсан ч бусдыг үргэлжлүүлнэ', async () => {
    repository.findStaleLiveSessions.mockResolvedValue([mockStaleSession, mockStaleSession2]);
    repository.update
      .mockRejectedValueOnce(new Error('DB алдаа'))
      .mockResolvedValueOnce(mockEndedSession);

    const result = await useCase.execute();

    /** Эхний session алдаатай, хоёр дахь нь амжилттай */
    expect(result).toBe(1);
    expect(repository.update).toHaveBeenCalledTimes(2);
  });

  it('findStaleLiveSessions 4 цагийн threshold-оор дуудна', async () => {
    repository.findStaleLiveSessions.mockResolvedValue([]);

    await useCase.execute();

    expect(repository.findStaleLiveSessions).toHaveBeenCalledWith(4);
  });
});
