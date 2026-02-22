import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CancelLiveSessionUseCase } from '../../application/use-cases/cancel-live-session.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

describe('CancelLiveSessionUseCase', () => {
  let useCase: CancelLiveSessionUseCase;
  let repository: jest.Mocked<LiveSessionRepository>;
  let cacheService: jest.Mocked<LiveClassesCacheService>;

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
  });

  const cancelledSession = new LiveSessionEntity({
    ...mockSession,
    status: 'cancelled',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelLiveSessionUseCase,
        {
          provide: LiveSessionRepository,
          useValue: { findById: jest.fn(), update: jest.fn() },
        },
        {
          provide: LiveClassesCacheService,
          useValue: { invalidateSession: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    useCase = module.get(CancelLiveSessionUseCase);
    repository = module.get(LiveSessionRepository);
    cacheService = module.get(LiveClassesCacheService);
  });

  it('амжилттай цуцална', async () => {
    repository.findById.mockResolvedValue(mockSession);
    repository.update.mockResolvedValue(cancelledSession);

    const result = await useCase.execute('session-1', 'instructor-1', 'TEACHER');
    expect(result.status).toBe('cancelled');
    expect(repository.update).toHaveBeenCalledWith('session-1', {
      status: 'CANCELLED',
    });
    expect(cacheService.invalidateSession).toHaveBeenCalled();
  });

  it('олдоогүй бол NotFoundException', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(useCase.execute('x', 'instructor-1', 'TEACHER')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('SCHEDULED биш бол BadRequestException', async () => {
    const liveSession = new LiveSessionEntity({ ...mockSession, status: 'live' });
    repository.findById.mockResolvedValue(liveSession);
    await expect(useCase.execute('session-1', 'instructor-1', 'TEACHER')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('эрхгүй бол ForbiddenException', async () => {
    repository.findById.mockResolvedValue(mockSession);
    await expect(useCase.execute('session-1', 'other-user', 'TEACHER')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
