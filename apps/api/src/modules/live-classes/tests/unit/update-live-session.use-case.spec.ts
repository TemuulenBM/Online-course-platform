import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UpdateLiveSessionUseCase } from '../../application/use-cases/update-live-session.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

describe('UpdateLiveSessionUseCase', () => {
  let useCase: UpdateLiveSessionUseCase;
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

  const mockLiveSession = new LiveSessionEntity({
    ...mockSession,
    status: 'live',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateLiveSessionUseCase,
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

    useCase = module.get(UpdateLiveSessionUseCase);
    repository = module.get(LiveSessionRepository);
    cacheService = module.get(LiveClassesCacheService);
  });

  it('амжилттай шинэчлэнэ', async () => {
    repository.findById.mockResolvedValue(mockSession);
    const updated = new LiveSessionEntity({
      ...mockSession,
      title: 'Шинэ нэр',
    });
    repository.update.mockResolvedValue(updated);

    const result = await useCase.execute('session-1', 'instructor-1', 'TEACHER', {
      title: 'Шинэ нэр',
    });
    expect(result.title).toBe('Шинэ нэр');
    expect(cacheService.invalidateSession).toHaveBeenCalledWith('session-1', 'lesson-1');
  });

  it('олдоогүй бол NotFoundException', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(useCase.execute('x', 'instructor-1', 'TEACHER', { title: 'A' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('SCHEDULED биш бол BadRequestException', async () => {
    repository.findById.mockResolvedValue(mockLiveSession);
    await expect(
      useCase.execute('session-1', 'instructor-1', 'TEACHER', { title: 'A' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('эрхгүй бол ForbiddenException', async () => {
    repository.findById.mockResolvedValue(mockSession);
    await expect(
      useCase.execute('session-1', 'other-user', 'TEACHER', { title: 'A' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('ADMIN зөвшөөрнө', async () => {
    repository.findById.mockResolvedValue(mockSession);
    repository.update.mockResolvedValue(mockSession);
    await expect(
      useCase.execute('session-1', 'other-user', 'ADMIN', { title: 'A' }),
    ).resolves.toBeDefined();
  });
});
