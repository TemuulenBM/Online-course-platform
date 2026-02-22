import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { StartLiveSessionUseCase } from '../../application/use-cases/start-live-session.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import { AGORA_SERVICE } from '../../domain/interfaces/agora-service.interface';

describe('StartLiveSessionUseCase', () => {
  let useCase: StartLiveSessionUseCase;
  let repository: jest.Mocked<LiveSessionRepository>;
  let cacheService: jest.Mocked<LiveClassesCacheService>;
  let mockQueue: { add: jest.Mock };

  const now = new Date();

  const mockSession = new LiveSessionEntity({
    id: 'session-1',
    lessonId: 'lesson-1',
    instructorId: 'instructor-1',
    title: 'Тест',
    description: null,
    scheduledStart: new Date(Date.now() + 3600000),
    scheduledEnd: new Date(Date.now() + 7200000),
    actualStart: null,
    actualEnd: null,
    meetingUrl: null,
    meetingId: null,
    recordingUrl: null,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
    courseId: 'course-1',
  });

  const mockLiveSession = new LiveSessionEntity({
    ...mockSession,
    status: 'live',
    meetingId: 'ocp-live-session-1',
    meetingUrl: 'ocp-live-session-1',
    actualStart: now,
  });

  beforeEach(async () => {
    mockQueue = { add: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartLiveSessionUseCase,
        {
          provide: LiveSessionRepository,
          useValue: { findById: jest.fn(), update: jest.fn() },
        },
        {
          provide: LiveClassesCacheService,
          useValue: { invalidateSession: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: AGORA_SERVICE,
          useValue: {
            generateRtcToken: jest.fn().mockReturnValue('mock-token'),
            generateChannelName: jest.fn().mockReturnValue('ocp-live-session-1'),
          },
        },
        { provide: getQueueToken('live-classes'), useValue: mockQueue },
      ],
    }).compile();

    useCase = module.get(StartLiveSessionUseCase);
    repository = module.get(LiveSessionRepository);
    cacheService = module.get(LiveClassesCacheService);
  });

  it('амжилттай session эхлүүлэх', async () => {
    repository.findById.mockResolvedValue(mockSession);
    repository.update.mockResolvedValue(mockLiveSession);

    const result = await useCase.execute('session-1', 'instructor-1');
    expect(result.token).toBe('mock-token');
    expect(result.channelName).toBe('ocp-live-session-1');
    expect(result.session).toEqual(mockLiveSession);
    expect(cacheService.invalidateSession).toHaveBeenCalled();
    expect(mockQueue.add).toHaveBeenCalledWith('session-started', {
      sessionId: 'session-1',
      courseId: 'course-1',
    });
  });

  it('олдоогүй бол NotFoundException', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(useCase.execute('x', 'instructor-1')).rejects.toThrow(NotFoundException);
  });

  it('SCHEDULED биш бол BadRequestException', async () => {
    repository.findById.mockResolvedValue(mockLiveSession);
    await expect(useCase.execute('session-1', 'instructor-1')).rejects.toThrow(BadRequestException);
  });

  it('instructor биш бол ForbiddenException', async () => {
    repository.findById.mockResolvedValue(mockSession);
    await expect(useCase.execute('session-1', 'other-user')).rejects.toThrow(ForbiddenException);
  });
});
