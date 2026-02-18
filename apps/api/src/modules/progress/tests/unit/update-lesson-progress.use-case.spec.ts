import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UpdateLessonProgressUseCase } from '../../application/use-cases/update-lesson-progress.use-case';
import { ProgressRepository } from '../../infrastructure/repositories/progress.repository';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';

describe('UpdateLessonProgressUseCase', () => {
  let useCase: UpdateLessonProgressUseCase;
  let progressRepository: jest.Mocked<ProgressRepository>;
  let progressCacheService: jest.Mocked<ProgressCacheService>;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;

  const now = new Date();

  /** Тестэд ашиглах mock хичээл */
  const mockLesson = {
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
        UpdateLessonProgressUseCase,
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

    useCase = module.get<UpdateLessonProgressUseCase>(UpdateLessonProgressUseCase);
    progressRepository = module.get(ProgressRepository);
    progressCacheService = module.get(ProgressCacheService);
    lessonRepository = module.get(LessonRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
  });

  it('амжилттай ахиц шинэчлэх', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressRepository.findByUserAndLesson.mockResolvedValue(null);
    progressRepository.upsert.mockResolvedValue(mockProgress);

    const result = await useCase.execute('user-id-1', 'lesson-id-1', {
      progressPercentage: 50,
      timeSpentSeconds: 300,
      lastPositionSeconds: 150,
    });

    expect(result).toEqual(mockProgress);
    expect(progressRepository.upsert).toHaveBeenCalledWith({
      userId: 'user-id-1',
      lessonId: 'lesson-id-1',
      progressPercentage: 50,
      timeSpentSeconds: 300,
      lastPositionSeconds: 150,
    });
    expect(progressCacheService.invalidateAll).toHaveBeenCalledWith(
      'user-id-1',
      'lesson-id-1',
      'course-id-1',
    );
  });

  it('хичээл олдсонгүй — NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-id-1', 'nonexistent', {
        progressPercentage: 50,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('хичээл нийтлэгдээгүй — BadRequestException', async () => {
    const unpublishedLesson = { ...mockLesson, isPublished: false };
    lessonRepository.findById.mockResolvedValue(unpublishedLesson as any);

    await expect(
      useCase.execute('user-id-1', 'lesson-id-1', {
        progressPercentage: 50,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('элсэлтгүй — ForbiddenException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    await expect(
      useCase.execute('user-id-1', 'lesson-id-1', {
        progressPercentage: 50,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('timeSpentSeconds нэмэгдүүлэх (additive)', async () => {
    /** Өмнө нь 300 секунд зарцуулсан, шинээр 120 нэмнэ → 420 */
    const existingProgress = new UserProgressEntity({
      ...mockProgress,
      timeSpentSeconds: 300,
    });
    lessonRepository.findById.mockResolvedValue(mockLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressRepository.findByUserAndLesson.mockResolvedValue(existingProgress);

    const updatedProgress = new UserProgressEntity({
      ...mockProgress,
      timeSpentSeconds: 420,
    });
    progressRepository.upsert.mockResolvedValue(updatedProgress);

    const result = await useCase.execute('user-id-1', 'lesson-id-1', {
      progressPercentage: 60,
      timeSpentSeconds: 120,
    });

    expect(result.timeSpentSeconds).toBe(420);
    expect(progressRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        timeSpentSeconds: 420,
      }),
    );
  });
});
