import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { GetLessonProgressUseCase } from '../../application/use-cases/get-lesson-progress.use-case';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';

describe('GetLessonProgressUseCase', () => {
  let useCase: GetLessonProgressUseCase;
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
        GetLessonProgressUseCase,
        {
          provide: ProgressCacheService,
          useValue: {
            getLessonProgress: jest.fn(),
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

    useCase = module.get<GetLessonProgressUseCase>(GetLessonProgressUseCase);
    progressCacheService = module.get(ProgressCacheService);
    lessonRepository = module.get(LessonRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
  });

  it('кэшнээс ахиц авах', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressCacheService.getLessonProgress.mockResolvedValue(mockProgress);

    const result = await useCase.execute('user-id-1', 'lesson-id-1');

    expect(result.id).toBe('progress-id-1');
    expect(result.progressPercentage).toBe(50);
    expect(result.completed).toBe(false);
    expect(progressCacheService.getLessonProgress).toHaveBeenCalledWith('user-id-1', 'lesson-id-1');
  });

  it('ахиц байхгүй — default утга буцаах', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressCacheService.getLessonProgress.mockResolvedValue(null);

    const result = await useCase.execute('user-id-1', 'lesson-id-1');

    /** Default утгууд */
    expect(result.id).toBe('');
    expect(result.progressPercentage).toBe(0);
    expect(result.completed).toBe(false);
    expect(result.timeSpentSeconds).toBe(0);
    expect(result.lastPositionSeconds).toBe(0);
    expect(result.completedAt).toBeNull();
    expect(result.lessonTitle).toBe('Хичээл 1');
    expect(result.lessonType).toBe('video');
    expect(result.courseId).toBe('course-id-1');
    expect(result.lessonOrderIndex).toBe(0);
  });

  it('элсэлтгүй — ForbiddenException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson as any);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    await expect(useCase.execute('user-id-1', 'lesson-id-1')).rejects.toThrow(ForbiddenException);
  });
});
