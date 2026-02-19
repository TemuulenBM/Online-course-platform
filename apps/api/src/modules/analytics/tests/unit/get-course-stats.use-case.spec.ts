import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetCourseStatsUseCase } from '../../application/use-cases/get-course-stats.use-case';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { AnalyticsCacheService } from '../../infrastructure/services/analytics-cache.service';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { CourseStats } from '../../domain/entities/course-stats.entity';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';

describe('GetCourseStatsUseCase', () => {
  let useCase: GetCourseStatsUseCase;
  let cacheService: jest.Mocked<AnalyticsCacheService>;
  let aggregationRepo: jest.Mocked<AnalyticsAggregationRepository>;
  let courseRepo: jest.Mocked<CourseRepository>;

  /** Mock course entity */
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

  const mockStatsResponse = {
    courseId: 'course-1',
    courseTitle: 'NestJS Сургалт',
    totalEnrollments: 30,
    activeEnrollments: 20,
    completedEnrollments: 8,
    cancelledEnrollments: 2,
    completionRate: 27,
    totalRevenue: 1500000,
    avgProgress: 65,
    totalLessons: 10,
    totalCertificates: 5,
    totalTimeSpentSeconds: 36000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCourseStatsUseCase,
        {
          provide: AnalyticsAggregationRepository,
          useValue: { getCourseStats: jest.fn() },
        },
        {
          provide: AnalyticsCacheService,
          useValue: { getCourseStats: jest.fn(), setCourseStats: jest.fn() },
        },
        {
          provide: CourseRepository,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetCourseStatsUseCase>(GetCourseStatsUseCase);
    cacheService = module.get(AnalyticsCacheService);
    aggregationRepo = module.get(AnalyticsAggregationRepository);
    courseRepo = module.get(CourseRepository);
  });

  it('ADMIN бүх сургалтын статистик харах боломжтой', async () => {
    cacheService.getCourseStats.mockResolvedValue(null);
    aggregationRepo.getCourseStats.mockResolvedValue(new CourseStats(mockStatsResponse));

    const result = await useCase.execute('course-1', 'admin-1', 'ADMIN');

    expect(result.courseId).toBe('course-1');
    expect(courseRepo.findById).not.toHaveBeenCalled(); // ADMIN шалгалт хийхгүй
  });

  it('TEACHER өөрийн сургалтын статистик харах боломжтой', async () => {
    courseRepo.findById.mockResolvedValue(mockCourse);
    cacheService.getCourseStats.mockResolvedValue(null);
    aggregationRepo.getCourseStats.mockResolvedValue(new CourseStats(mockStatsResponse));

    const result = await useCase.execute('course-1', 'teacher-1', 'TEACHER');

    expect(result.courseId).toBe('course-1');
    expect(courseRepo.findById).toHaveBeenCalledWith('course-1');
  });

  it('TEACHER бусдын сургалтын статистик харахад ForbiddenException', async () => {
    courseRepo.findById.mockResolvedValue(mockCourse);

    await expect(useCase.execute('course-1', 'other-teacher', 'TEACHER')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('олдоогүй сургалтын хувьд NotFoundException', async () => {
    courseRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent', 'teacher-1', 'TEACHER')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('кэшнээс олдвол шууд буцаана', async () => {
    cacheService.getCourseStats.mockResolvedValue(mockStatsResponse);

    const result = await useCase.execute('course-1', 'admin-1', 'ADMIN');

    expect(result).toEqual(mockStatsResponse);
    expect(aggregationRepo.getCourseStats).not.toHaveBeenCalled();
  });

  it('aggregation null буцаавал NotFoundException', async () => {
    cacheService.getCourseStats.mockResolvedValue(null);
    aggregationRepo.getCourseStats.mockResolvedValue(null);

    await expect(useCase.execute('course-1', 'admin-1', 'ADMIN')).rejects.toThrow(
      NotFoundException,
    );
  });
});
