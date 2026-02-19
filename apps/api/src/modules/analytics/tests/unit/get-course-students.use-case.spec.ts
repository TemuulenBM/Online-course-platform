import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetCourseStudentsUseCase } from '../../application/use-cases/get-course-students.use-case';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';

describe('GetCourseStudentsUseCase', () => {
  let useCase: GetCourseStudentsUseCase;
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

  const mockStudentsResult = {
    data: [
      {
        userId: 'user-1',
        userName: 'Бат Дорж',
        email: 'bat@test.com',
        enrollmentStatus: 'active',
        enrolledAt: new Date('2025-01-15'),
        completedAt: null,
        progressPercentage: 45,
        completedLessons: 3,
        totalTimeSpentSeconds: 7200,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCourseStudentsUseCase,
        {
          provide: AnalyticsAggregationRepository,
          useValue: { getCourseStudents: jest.fn() },
        },
        {
          provide: CourseRepository,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetCourseStudentsUseCase>(GetCourseStudentsUseCase);
    aggregationRepo = module.get(AnalyticsAggregationRepository);
    courseRepo = module.get(CourseRepository);
  });

  it('оюутнуудын жагсаалтыг pagination-тэй буцаана', async () => {
    courseRepo.findById.mockResolvedValue(mockCourse);
    aggregationRepo.getCourseStudents.mockResolvedValue(mockStudentsResult);

    const result = await useCase.execute('course-1', 'teacher-1', 'TEACHER', {
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(aggregationRepo.getCourseStudents).toHaveBeenCalledWith('course-1', {
      page: 1,
      limit: 20,
    });
  });

  it('ADMIN бүх сургалтад хандах боломжтой', async () => {
    aggregationRepo.getCourseStudents.mockResolvedValue(mockStudentsResult);

    const result = await useCase.execute('course-1', 'admin-1', 'ADMIN', {
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(1);
    expect(courseRepo.findById).not.toHaveBeenCalled();
  });

  it('TEACHER бусдын сургалтад хандахад ForbiddenException', async () => {
    courseRepo.findById.mockResolvedValue(mockCourse);

    await expect(
      useCase.execute('course-1', 'other-teacher', 'TEACHER', {
        page: 1,
        limit: 20,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('олдоогүй сургалтад NotFoundException', async () => {
    courseRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', 'teacher-1', 'TEACHER', {
        page: 1,
        limit: 20,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
