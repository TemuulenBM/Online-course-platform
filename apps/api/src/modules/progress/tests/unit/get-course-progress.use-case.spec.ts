import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetCourseProgressUseCase } from '../../application/use-cases/get-course-progress.use-case';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';

describe('GetCourseProgressUseCase', () => {
  let useCase: GetCourseProgressUseCase;
  let progressCacheService: jest.Mocked<ProgressCacheService>;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;

  const now = new Date();

  /** Тестэд ашиглах mock хичээлүүд */
  const mockLesson1 = {
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

  const mockLesson2 = {
    ...mockLesson1,
    id: 'lesson-id-2',
    title: 'Хичээл 2',
    orderIndex: 1,
    lessonType: 'text',
  };

  const mockLesson3 = {
    ...mockLesson1,
    id: 'lesson-id-3',
    title: 'Хичээл 3',
    orderIndex: 2,
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

  /** Тестэд ашиглах mock ахицууд */
  const mockProgress1 = new UserProgressEntity({
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

  const mockProgress2 = new UserProgressEntity({
    id: 'progress-id-2',
    userId: 'user-id-1',
    lessonId: 'lesson-id-2',
    progressPercentage: 50,
    completed: false,
    timeSpentSeconds: 300,
    lastPositionSeconds: 0,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    lessonTitle: 'Хичээл 2',
    lessonType: 'text',
    courseId: 'course-id-1',
    lessonOrderIndex: 1,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCourseProgressUseCase,
        {
          provide: ProgressCacheService,
          useValue: {
            getCourseProgress: jest.fn(),
          },
        },
        {
          provide: LessonRepository,
          useValue: {
            findByCourseId: jest.fn(),
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

    useCase = module.get<GetCourseProgressUseCase>(GetCourseProgressUseCase);
    progressCacheService = module.get(ProgressCacheService);
    lessonRepository = module.get(LessonRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
  });

  it('сургалтын ахицын нэгтгэл зөв тооцоолох', async () => {
    /** 3 хичээл, 1 дууссан, 1 хагас, 1 эхлээгүй */
    lessonRepository.findByCourseId.mockResolvedValue([
      mockLesson1 as any,
      mockLesson2 as any,
      mockLesson3 as any,
    ]);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressCacheService.getCourseProgress.mockResolvedValue([
      mockProgress1,
      mockProgress2,
    ]);

    const result = await useCase.execute('user-id-1', 'course-id-1');

    expect(result.courseId).toBe('course-id-1');
    expect(result.totalLessons).toBe(3);
    expect(result.completedLessons).toBe(1);
    /** 1/3 = 33% (Math.round) */
    expect(result.courseProgressPercentage).toBe(33);
    expect(result.courseCompleted).toBe(false);
    expect(result.totalTimeSpentSeconds).toBe(900);
    expect(result.lessons).toHaveLength(3);
    /** Эхний хичээл дууссан */
    expect(result.lessons[0].completed).toBe(true);
    expect(result.lessons[0].progressPercentage).toBe(100);
    /** Хоёр дахь хичээл хагас */
    expect(result.lessons[1].completed).toBe(false);
    expect(result.lessons[1].progressPercentage).toBe(50);
    /** Гурав дахь хичээл эхлээгүй — default 0% */
    expect(result.lessons[2].completed).toBe(false);
    expect(result.lessons[2].progressPercentage).toBe(0);
    expect(result.lessons[2].timeSpentSeconds).toBe(0);
  });

  it('хичээлгүй сургалт — NotFoundException', async () => {
    lessonRepository.findByCourseId.mockResolvedValue([]);

    await expect(
      useCase.execute('user-id-1', 'course-id-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('элсэлтгүй — ForbiddenException', async () => {
    lessonRepository.findByCourseId.mockResolvedValue([mockLesson1 as any]);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

    await expect(
      useCase.execute('user-id-1', 'course-id-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('хоосон ахицтай — 0% progress', async () => {
    /** 2 хичээл, нэг ч ахиц бүртгэгдээгүй */
    lessonRepository.findByCourseId.mockResolvedValue([
      mockLesson1 as any,
      mockLesson2 as any,
    ]);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment as any);
    progressCacheService.getCourseProgress.mockResolvedValue([]);

    const result = await useCase.execute('user-id-1', 'course-id-1');

    expect(result.courseProgressPercentage).toBe(0);
    expect(result.completedLessons).toBe(0);
    expect(result.courseCompleted).toBe(false);
    expect(result.totalTimeSpentSeconds).toBe(0);
    /** Бүх хичээл default утгатай */
    result.lessons.forEach((lesson) => {
      expect(lesson.progressPercentage).toBe(0);
      expect(lesson.completed).toBe(false);
      expect(lesson.timeSpentSeconds).toBe(0);
    });
  });
});
