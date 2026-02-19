import { Test, TestingModule } from '@nestjs/testing';
import { CourseAnalyticsController } from '../../interface/controllers/course-analytics.controller';
import { GetCourseStatsUseCase } from '../../application/use-cases/get-course-stats.use-case';
import { GetCourseStudentsUseCase } from '../../application/use-cases/get-course-students.use-case';
import { GetCourseLessonsUseCase } from '../../application/use-cases/get-course-lessons.use-case';

describe('CourseAnalyticsController', () => {
  let controller: CourseAnalyticsController;
  let getCourseStatsUseCase: jest.Mocked<GetCourseStatsUseCase>;
  let getCourseStudentsUseCase: jest.Mocked<GetCourseStudentsUseCase>;
  let getCourseLessonsUseCase: jest.Mocked<GetCourseLessonsUseCase>;

  /** Тестэд ашиглах mock сургалтын статистик */
  const mockCourseStats = {
    courseId: 'course-1',
    courseTitle: 'Тест сургалт',
    totalEnrollments: 50,
    activeEnrollments: 30,
    completedEnrollments: 15,
    averageProgress: 65,
    totalRevenue: 2500000,
    averageRating: 4.5,
  };

  /** Тестэд ашиглах mock оюутнуудын жагсаалт */
  const mockStudentsResult = {
    data: [
      {
        userId: 'user-1',
        userName: 'Student 1',
        progress: 80,
        enrolledAt: new Date().toISOString(),
      },
      {
        userId: 'user-2',
        userName: 'Student 2',
        progress: 45,
        enrolledAt: new Date().toISOString(),
      },
    ],
    total: 2,
    page: 1,
    limit: 20,
  };

  /** Тестэд ашиглах mock хичээлүүдийн статистик */
  const mockLessonsResult = [
    {
      lessonId: 'lesson-1',
      lessonTitle: 'Хичээл 1',
      completionRate: 75,
      averageTimeSpent: 1200,
    },
    {
      lessonId: 'lesson-2',
      lessonTitle: 'Хичээл 2',
      completionRate: 50,
      averageTimeSpent: 900,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseAnalyticsController],
      providers: [
        {
          provide: GetCourseStatsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetCourseStudentsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetCourseLessonsUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<CourseAnalyticsController>(CourseAnalyticsController);
    getCourseStatsUseCase = module.get(GetCourseStatsUseCase);
    getCourseStudentsUseCase = module.get(GetCourseStudentsUseCase);
    getCourseLessonsUseCase = module.get(GetCourseLessonsUseCase);
  });

  it('controller тодорхойлогдсон байх', () => {
    expect(controller).toBeDefined();
  });

  describe('getCourseStats', () => {
    it('courseId, userId, userRole-г GetCourseStatsUseCase-д зөв дамжуулах', async () => {
      getCourseStatsUseCase.execute.mockResolvedValue(mockCourseStats);

      const result = await controller.getCourseStats('course-1', 'user-1', 'TEACHER');

      expect(getCourseStatsUseCase.execute).toHaveBeenCalledWith('course-1', 'user-1', 'TEACHER');
      expect(result).toEqual(mockCourseStats);
    });

    it('ADMIN эрхтэй хэрэглэгчийн хүсэлтийг зөв дамжуулах', async () => {
      getCourseStatsUseCase.execute.mockResolvedValue(mockCourseStats);

      const result = await controller.getCourseStats('course-1', 'admin-1', 'ADMIN');

      expect(getCourseStatsUseCase.execute).toHaveBeenCalledWith('course-1', 'admin-1', 'ADMIN');
      expect(result).toEqual(mockCourseStats);
    });
  });

  describe('getCourseStudents', () => {
    it('courseId, userId, userRole, pagination-г GetCourseStudentsUseCase-д зөв дамжуулах', async () => {
      getCourseStudentsUseCase.execute.mockResolvedValue(mockStudentsResult);

      const query = { page: 1, limit: 20 };
      const result = await controller.getCourseStudents('course-1', 'user-1', 'TEACHER', query);

      expect(getCourseStudentsUseCase.execute).toHaveBeenCalledWith(
        'course-1',
        'user-1',
        'TEACHER',
        { page: 1, limit: 20 },
      );
      expect(result).toEqual(mockStudentsResult);
    });

    it('query параметр байхгүй бол default утгууд дамжуулах', async () => {
      getCourseStudentsUseCase.execute.mockResolvedValue(mockStudentsResult);

      const query = { page: undefined, limit: undefined };
      const result = await controller.getCourseStudents(
        'course-1',
        'user-1',
        'ADMIN',
        query as any,
      );

      expect(getCourseStudentsUseCase.execute).toHaveBeenCalledWith('course-1', 'user-1', 'ADMIN', {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(mockStudentsResult);
    });
  });

  describe('getCourseLessons', () => {
    it('courseId, userId, userRole-г GetCourseLessonsUseCase-д зөв дамжуулах', async () => {
      getCourseLessonsUseCase.execute.mockResolvedValue(mockLessonsResult);

      const result = await controller.getCourseLessons('course-1', 'user-1', 'TEACHER');

      expect(getCourseLessonsUseCase.execute).toHaveBeenCalledWith('course-1', 'user-1', 'TEACHER');
      expect(result).toEqual(mockLessonsResult);
    });

    it('ADMIN эрхтэй хэрэглэгчийн хүсэлтийг зөв дамжуулах', async () => {
      getCourseLessonsUseCase.execute.mockResolvedValue(mockLessonsResult);

      const result = await controller.getCourseLessons('course-1', 'admin-1', 'ADMIN');

      expect(getCourseLessonsUseCase.execute).toHaveBeenCalledWith('course-1', 'admin-1', 'ADMIN');
      expect(result).toEqual(mockLessonsResult);
    });
  });
});
