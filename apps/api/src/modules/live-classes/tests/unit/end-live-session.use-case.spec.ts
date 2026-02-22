import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { EndLiveSessionUseCase } from '../../application/use-cases/end-live-session.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

describe('EndLiveSessionUseCase', () => {
  let useCase: EndLiveSessionUseCase;
  let repository: jest.Mocked<LiveSessionRepository>;
  let cacheService: jest.Mocked<LiveClassesCacheService>;
  let mockQueue: { add: jest.Mock };

  const now = new Date();

  const mockLiveSession = new LiveSessionEntity({
    id: 'session-1',
    lessonId: 'lesson-1',
    instructorId: 'instructor-1',
    title: 'Тест',
    description: null,
    scheduledStart: now,
    scheduledEnd: new Date(now.getTime() + 3600000),
    actualStart: now,
    actualEnd: null,
    meetingUrl: 'ocp-live-session-1',
    meetingId: 'ocp-live-session-1',
    recordingUrl: null,
    status: 'live',
    createdAt: now,
    updatedAt: now,
    courseId: 'course-1',
  });

  const mockEndedSession = new LiveSessionEntity({
    ...mockLiveSession,
    status: 'ended',
    actualEnd: now,
  });

  beforeEach(async () => {
    mockQueue = { add: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EndLiveSessionUseCase,
        {
          provide: LiveSessionRepository,
          useValue: { findById: jest.fn(), update: jest.fn() },
        },
        {
          provide: LiveClassesCacheService,
          useValue: { invalidateSession: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: getQueueToken('live-classes'), useValue: mockQueue },
      ],
    }).compile();

    useCase = module.get(EndLiveSessionUseCase);
    repository = module.get(LiveSessionRepository);
    cacheService = module.get(LiveClassesCacheService);
  });

  it('амжилттай session дуусгах', async () => {
    repository.findById.mockResolvedValue(mockLiveSession);
    repository.update.mockResolvedValue(mockEndedSession);

    const result = await useCase.execute('session-1', 'instructor-1');
    expect(result.status).toBe('ended');
    expect(repository.update).toHaveBeenCalledWith('session-1', {
      status: 'ENDED',
      actualEnd: expect.any(Date),
    });
    expect(cacheService.invalidateSession).toHaveBeenCalled();
    expect(mockQueue.add).toHaveBeenCalledWith('session-ended', {
      sessionId: 'session-1',
      courseId: 'course-1',
    });
  });

  it('олдоогүй бол NotFoundException', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(useCase.execute('x', 'instructor-1')).rejects.toThrow(NotFoundException);
  });

  it('LIVE биш бол BadRequestException', async () => {
    const scheduled = new LiveSessionEntity({
      ...mockLiveSession,
      status: 'scheduled',
    });
    repository.findById.mockResolvedValue(scheduled);
    await expect(useCase.execute('session-1', 'instructor-1')).rejects.toThrow(BadRequestException);
  });

  it('instructor биш бол ForbiddenException', async () => {
    repository.findById.mockResolvedValue(mockLiveSession);
    await expect(useCase.execute('session-1', 'other-user')).rejects.toThrow(ForbiddenException);
  });
});
