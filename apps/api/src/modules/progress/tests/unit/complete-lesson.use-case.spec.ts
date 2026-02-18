import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CompleteLessonUseCase } from '../../application/use-cases/complete-lesson.use-case';
import { ProgressRepository } from '../../infrastructure/repositories/progress.repository';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { RedisService } from '../../../../common/redis/redis.service';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';

describe('CompleteLessonUseCase', () => {
  let useCase: CompleteLessonUseCase;
  let progressRepository: jest.Mocked<ProgressRepository>;
  let progressCacheService: jest.Mocked<ProgressCacheService>;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
  let redisService: jest.Mocked<RedisService>;

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

  /** Тестэд ашиглах mock ахиц (дуусаагүй) */
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

  /** Тестэд ашиглах mock ахиц (дууссан) */
  const mockCompletedProgress = new UserProgressEntity({
    id: 'progress-id-1',
    userId: 'user-id-1',
    lessonId: 'lesson-id-1',
    progressPercentage: 100,
    completed: true,
    timeSpentSeconds: 600,
    lastPositionSeconds: 1800,
    completedAt: now,
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
        CompleteLessonUseCase,
        {
          provide: ProgressRepository,
          useValue: {
            findByUserAndLesson: jest.fn(),
            upsert: jest.fn(),
            countCompletedLessons: jest.fn(),
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
            findByCourseId: jest.fn(),
          },
        },
        {
          provide: EnrollmentRepository,
          useValue: {
            findByUserAndCourse: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CompleteLessonUseCase>(CompleteLessonUseCase);
    progressRepository = module.get(ProgressRepository);
    progressCacheService = module.get(ProgressCacheService);
    lessonRepository = module.get(LessonRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
    redisService = module.get(RedisService);
  });

  it('амжилттай хичээл дуусгах', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressRepository.findByUserAndLesson.mockResolvedValue(null);
    progressRepository.upsert.mockResolvedValue(mockCompletedProgress);
    /** Бүх хичээл дуусаагүй — auto-complete биш */
    lessonRepository.findByCourseId.mockResolvedValue([mockLesson as any, { ...mockLesson, id: 'lesson-id-2' } as any]);
    progressRepository.countCompletedLessons.mockResolvedValue(1);

    const result = await useCase.execute('user-id-1', 'lesson-id-1');

    expect(result.progress).toEqual(mockCompletedProgress);
    expect(result.courseCompleted).toBe(false);
    expect(progressRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-id-1',
        lessonId: 'lesson-id-1',
        progressPercentage: 100,
        completed: true,
      }),
    );
    expect(progressCacheService.invalidateAll).toHaveBeenCalledWith(
      'user-id-1',
      'lesson-id-1',
      'course-id-1',
    );
  });

  it('хичээл олдсонгүй — NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-id-1', 'nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('хичээл нийтлэгдээгүй — BadRequestException', async () => {
    const unpublishedLesson = { ...mockLesson, isPublished: false };
    lessonRepository.findById.mockResolvedValue(unpublishedLesson as any);

    await expect(useCase.execute('user-id-1', 'lesson-id-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('элсэлтгүй — ForbiddenException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    await expect(useCase.execute('user-id-1', 'lesson-id-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('аль хэдийн дуусгасан — ConflictException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressRepository.findByUserAndLesson.mockResolvedValue(mockCompletedProgress);

    await expect(useCase.execute('user-id-1', 'lesson-id-1')).rejects.toThrow(
      ConflictException,
    );
  });

  it('auto-complete enrollment — бүх хичээл дууссан', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressRepository.findByUserAndLesson.mockResolvedValue(null);
    progressRepository.upsert.mockResolvedValue(mockCompletedProgress);
    /** Нэг л хичээлтэй сургалт — тэр хичээл дууссан */
    lessonRepository.findByCourseId.mockResolvedValue([mockLesson as any]);
    progressRepository.countCompletedLessons.mockResolvedValue(1);
    enrollmentRepository.update.mockResolvedValue({
      ...mockEnrollment,
      status: 'completed',
      completedAt: now,
    } as any);

    const result = await useCase.execute('user-id-1', 'lesson-id-1');

    expect(result.courseCompleted).toBe(true);
    expect(enrollmentRepository.update).toHaveBeenCalledWith('enrollment-id-1', {
      status: 'completed',
      completedAt: expect.any(Date),
    });
    /** Enrollment кэш мөн invalidate хийгдсэн */
    expect(redisService.del).toHaveBeenCalledWith('enrollment:enrollment-id-1');
    expect(redisService.del).toHaveBeenCalledWith(
      'enrollment:check:user-id-1:course-id-1',
    );
  });

  it('auto-complete enrollment — зарим хичээл дуусаагүй', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressRepository.findByUserAndLesson.mockResolvedValue(null);
    progressRepository.upsert.mockResolvedValue(mockCompletedProgress);
    /** 3 хичээлтэй сургалт — зөвхөн 1 дууссан */
    lessonRepository.findByCourseId.mockResolvedValue([
      mockLesson as any,
      { ...mockLesson, id: 'lesson-id-2' } as any,
      { ...mockLesson, id: 'lesson-id-3' } as any,
    ]);
    progressRepository.countCompletedLessons.mockResolvedValue(1);

    const result = await useCase.execute('user-id-1', 'lesson-id-1');

    expect(result.courseCompleted).toBe(false);
    expect(enrollmentRepository.update).not.toHaveBeenCalled();
  });
});
