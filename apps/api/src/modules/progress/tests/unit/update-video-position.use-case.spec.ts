import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateVideoPositionUseCase } from '../../application/use-cases/update-video-position.use-case';
import { ProgressRepository } from '../../infrastructure/repositories/progress.repository';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';

describe('UpdateVideoPositionUseCase', () => {
  let useCase: UpdateVideoPositionUseCase;
  let progressRepository: jest.Mocked<ProgressRepository>;
  let progressCacheService: jest.Mocked<ProgressCacheService>;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;

  const now = new Date();

  /** Тестэд ашиглах mock хичээл (VIDEO төрөл, 30 минут) */
  const mockVideoLesson = {
    id: 'lesson-id-1',
    courseId: 'course-id-1',
    title: 'Хичээл 1',
    orderIndex: 0,
    lessonType: 'video',
    durationMinutes: 30,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
    courseTitle: 'Сургалт 1',
    courseInstructorId: 'instructor-id-1',
  };

  /** Тестэд ашиглах mock хичээл (TEXT төрөл) */
  const mockTextLesson = {
    ...mockVideoLesson,
    id: 'lesson-id-2',
    title: 'Текст хичээл',
    lessonType: 'text',
    durationMinutes: 0,
  };

  /** Тестэд ашиглах mock элсэлт */
  const mockEnrollment = {
    id: 'enrollment-id-1',
    userId: 'user-id-1',
    courseId: 'course-id-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  /** Тестэд ашиглах mock ахиц */
  const mockProgress = new UserProgressEntity({
    id: 'progress-id-1',
    userId: 'user-id-1',
    lessonId: 'lesson-id-1',
    progressPercentage: 50,
    completed: false,
    timeSpentSeconds: 300,
    lastPositionSeconds: 900,
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
        UpdateVideoPositionUseCase,
        {
          provide: ProgressRepository,
          useValue: {
            findByUserAndLesson: jest.fn(),
            upsert: jest.fn(),
          },
        },
        {
          provide: ProgressCacheService,
          useValue: {
            invalidateAll: jest.fn(),
          },
        },
        {
          provide: LessonRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EnrollmentRepository,
          useValue: {
            findByUserAndCourse: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateVideoPositionUseCase>(UpdateVideoPositionUseCase);
    progressRepository = module.get(ProgressRepository);
    progressCacheService = module.get(ProgressCacheService);
    lessonRepository = module.get(LessonRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
  });

  it('амжилттай видео байрлал шинэчлэх', async () => {
    lessonRepository.findById.mockResolvedValue(mockVideoLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressRepository.findByUserAndLesson.mockResolvedValue(null);
    progressRepository.upsert.mockResolvedValue(mockProgress);

    const result = await useCase.execute('user-id-1', 'lesson-id-1', {
      lastPositionSeconds: 900,
      timeSpentSeconds: 300,
    });

    expect(result).toEqual(mockProgress);
    expect(progressRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-id-1',
        lessonId: 'lesson-id-1',
        lastPositionSeconds: 900,
      }),
    );
    expect(progressCacheService.invalidateAll).toHaveBeenCalledWith(
      'user-id-1',
      'lesson-id-1',
      'course-id-1',
    );
  });

  it('VIDEO биш хичээл — BadRequestException', async () => {
    lessonRepository.findById.mockResolvedValue(mockTextLesson as any);

    await expect(
      useCase.execute('user-id-1', 'lesson-id-2', {
        lastPositionSeconds: 100,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('автоматаар progressPercentage тооцоолох', async () => {
    /** 30 минут = 1800 секунд, байрлал 900с → 50% */
    lessonRepository.findById.mockResolvedValue(mockVideoLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressRepository.findByUserAndLesson.mockResolvedValue(null);

    const expectedProgress = new UserProgressEntity({
      ...mockProgress,
      progressPercentage: 50,
      lastPositionSeconds: 900,
    });
    progressRepository.upsert.mockResolvedValue(expectedProgress);

    await useCase.execute('user-id-1', 'lesson-id-1', {
      lastPositionSeconds: 900,
    });

    /** progressPercentage = Math.round((900 / 1800) * 100) = 50 */
    expect(progressRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        progressPercentage: 50,
      }),
    );
  });

  it('элсэлтгүй — ForbiddenException', async () => {
    lessonRepository.findById.mockResolvedValue(mockVideoLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    await expect(
      useCase.execute('user-id-1', 'lesson-id-1', {
        lastPositionSeconds: 900,
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
