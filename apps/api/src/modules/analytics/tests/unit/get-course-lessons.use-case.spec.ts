import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetCourseLessonsUseCase } from '../../application/use-cases/get-course-lessons.use-case';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';
import { LessonStatsItem } from '../../domain/entities/lesson-stats.entity';

describe('GetCourseLessonsUseCase', () => {
  let useCase: GetCourseLessonsUseCase;
  let aggregationRepo: jest.Mocked<AnalyticsAggregationRepository>;
  let courseRepo: jest.Mocked<CourseRepository>;

  const mockCourse = new CourseEntity({
    id: 'course-1',
    title: 'NestJS Сургалт',
    slug: 'nestjs-surgalt',
    description: 'Тайлбар',
    instructorId: 'teacher-1',
    categoryId: 'cat-1',
    price: 50000,
    discountPrice: null,
    difficulty: 'BEGINNER',
    language: 'mn',
    status: 'PUBLISHED',
    thumbnailUrl: null,
    durationMinutes: 600,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockLessonStats = [
    new LessonStatsItem({
      lessonId: 'lesson-1',
      lessonTitle: 'Оршил',
      lessonType: 'video',
      orderIndex: 0,
      totalStudents: 25,
      completedStudents: 20,
      completionRate: 80,
      avgTimeSpentSeconds: 600,
      avgProgress: 90,
    }),
    new LessonStatsItem({
      lessonId: 'lesson-2',
      lessonTitle: 'NestJS Суурь',
      lessonType: 'text',
      orderIndex: 1,
      totalStudents: 22,
      completedStudents: 15,
      completionRate: 68,
      avgTimeSpentSeconds: 900,
      avgProgress: 75,
    }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCourseLessonsUseCase,
        {
          provide: AnalyticsAggregationRepository,
          useValue: { getCourseLessonStats: jest.fn() },
        },
        {
          provide: CourseRepository,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetCourseLessonsUseCase>(GetCourseLessonsUseCase);
    aggregationRepo = module.get(AnalyticsAggregationRepository);
    courseRepo = module.get(CourseRepository);
  });

  it('хичээлийн статистик жагсаалтыг буцаана', async () => {
    courseRepo.findById.mockResolvedValue(mockCourse);
    aggregationRepo.getCourseLessonStats.mockResolvedValue(mockLessonStats);

    const result = await useCase.execute('course-1', 'teacher-1', 'TEACHER');

    expect(result).toHaveLength(2);
    expect(result[0].lessonId).toBe('lesson-1');
    expect(result[0].completionRate).toBe(80);
    expect(result[1].lessonType).toBe('text');
  });

  it('ADMIN бүх сургалтад хандах боломжтой', async () => {
    aggregationRepo.getCourseLessonStats.mockResolvedValue(mockLessonStats);

    const result = await useCase.execute('course-1', 'admin-1', 'ADMIN');

    expect(result).toHaveLength(2);
    expect(courseRepo.findById).not.toHaveBeenCalled();
  });

  it('TEACHER бусдын сургалтад хандахад ForbiddenException', async () => {
    courseRepo.findById.mockResolvedValue(mockCourse);

    await expect(useCase.execute('course-1', 'other-teacher', 'TEACHER')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('олдоогүй сургалтад NotFoundException', async () => {
    courseRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent', 'teacher-1', 'TEACHER')).rejects.toThrow(
      NotFoundException,
    );
  });
});
