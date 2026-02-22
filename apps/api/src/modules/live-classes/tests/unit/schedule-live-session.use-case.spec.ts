import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { ScheduleLiveSessionUseCase } from '../../application/use-cases/schedule-live-session.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import { LessonEntity } from '../../../lessons/domain/entities/lesson.entity';
import { CreateLiveSessionDto } from '../../dto/create-live-session.dto';

describe('ScheduleLiveSessionUseCase', () => {
  let useCase: ScheduleLiveSessionUseCase;
  let liveSessionRepository: jest.Mocked<LiveSessionRepository>;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let mockQueue: { add: jest.Mock };

  const now = new Date();

  const mockLesson = new LessonEntity({
    id: 'lesson-1',
    courseId: 'course-1',
    title: 'Тест хичээл',
    orderIndex: 0,
    lessonType: 'live',
    durationMinutes: 60,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
    courseTitle: 'Тест сургалт',
    courseInstructorId: 'instructor-1',
  });

  const mockSession = new LiveSessionEntity({
    id: 'session-1',
    lessonId: 'lesson-1',
    instructorId: 'instructor-1',
    title: 'Тест шууд хичээл',
    description: 'Тайлбар',
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

  beforeEach(async () => {
    mockQueue = { add: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleLiveSessionUseCase,
        {
          provide: LiveSessionRepository,
          useValue: { findByLessonId: jest.fn(), create: jest.fn() },
        },
        {
          provide: LessonRepository,
          useValue: { findById: jest.fn() },
        },
        { provide: getQueueToken('live-classes'), useValue: mockQueue },
      ],
    }).compile();

    useCase = module.get(ScheduleLiveSessionUseCase);
    liveSessionRepository = module.get(LiveSessionRepository);
    lessonRepository = module.get(LessonRepository);
  });

  const createDto = (overrides: Partial<CreateLiveSessionDto> = {}): CreateLiveSessionDto => {
    const dto = new CreateLiveSessionDto();
    dto.lessonId = overrides.lessonId ?? 'lesson-1';
    dto.title = overrides.title ?? 'Тест шууд хичээл';
    dto.description = overrides.description ?? 'Тайлбар';
    dto.scheduledStart = overrides.scheduledStart ?? new Date(Date.now() + 3600000).toISOString();
    dto.scheduledEnd = overrides.scheduledEnd ?? new Date(Date.now() + 7200000).toISOString();
    return dto;
  };

  it('амжилттай session товлоно', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    liveSessionRepository.findByLessonId.mockResolvedValue(null);
    liveSessionRepository.create.mockResolvedValue(mockSession);

    const result = await useCase.execute('instructor-1', 'TEACHER', createDto());

    expect(result).toEqual(mockSession);
    expect(liveSessionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: 'lesson-1',
        instructorId: 'instructor-1',
      }),
    );
  });

  it('хичээл олдоогүй бол NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('instructor-1', 'TEACHER', createDto())).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lessonType !== live бол BadRequestException', async () => {
    const videoLesson = new LessonEntity({ ...mockLesson, lessonType: 'video' });
    lessonRepository.findById.mockResolvedValue(videoLesson);
    await expect(useCase.execute('instructor-1', 'TEACHER', createDto())).rejects.toThrow(
      BadRequestException,
    );
  });

  it('эрхгүй бол ForbiddenException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    await expect(useCase.execute('other-user', 'TEACHER', createDto())).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('ADMIN эрхтэй бол зөвшөөрнө', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    liveSessionRepository.findByLessonId.mockResolvedValue(null);
    liveSessionRepository.create.mockResolvedValue(mockSession);

    const result = await useCase.execute('other-user', 'ADMIN', createDto());
    expect(result).toEqual(mockSession);
  });

  it('давхардал бол ConflictException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    liveSessionRepository.findByLessonId.mockResolvedValue(mockSession);
    await expect(useCase.execute('instructor-1', 'TEACHER', createDto())).rejects.toThrow(
      ConflictException,
    );
  });

  it('scheduledStart >= scheduledEnd бол BadRequestException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    liveSessionRepository.findByLessonId.mockResolvedValue(null);
    const dto = createDto({
      scheduledStart: new Date(Date.now() + 7200000).toISOString(),
      scheduledEnd: new Date(Date.now() + 3600000).toISOString(),
    });
    await expect(useCase.execute('instructor-1', 'TEACHER', dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('өнгөрсөн цаг бол BadRequestException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    liveSessionRepository.findByLessonId.mockResolvedValue(null);
    const dto = createDto({
      scheduledStart: new Date(Date.now() - 7200000).toISOString(),
      scheduledEnd: new Date(Date.now() - 3600000).toISOString(),
    });
    await expect(useCase.execute('instructor-1', 'TEACHER', dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('reminder delayed job тавигдана', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    liveSessionRepository.findByLessonId.mockResolvedValue(null);
    liveSessionRepository.create.mockResolvedValue(mockSession);

    await useCase.execute('instructor-1', 'TEACHER', createDto());

    expect(mockQueue.add).toHaveBeenCalledWith(
      'session-reminder',
      expect.objectContaining({ sessionId: 'session-1' }),
      expect.objectContaining({ delay: expect.any(Number) }),
    );
  });
});
