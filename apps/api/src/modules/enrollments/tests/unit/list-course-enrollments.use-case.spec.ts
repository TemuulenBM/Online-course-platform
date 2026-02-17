import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ListCourseEnrollmentsUseCase } from '../../application/use-cases/list-course-enrollments.use-case';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';

describe('ListCourseEnrollmentsUseCase', () => {
  let useCase: ListCourseEnrollmentsUseCase;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
  let courseRepository: jest.Mocked<CourseRepository>;

  const now = new Date();

  const mockCourse = new CourseEntity({
    id: 'course-id-1',
    title: 'Сургалт',
    slug: 'surgalt',
    description: 'Тайлбар',
    instructorId: 'instructor-id-1',
    categoryId: 'cat-id-1',
    price: null,
    discountPrice: null,
    difficulty: 'beginner',
    language: 'mn',
    status: 'published',
    thumbnailUrl: null,
    durationMinutes: 0,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  const mockEnrollment = new EnrollmentEntity({
    id: 'enrollment-id-1',
    userId: 'student-id-1',
    courseId: 'course-id-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    userName: 'Бат',
    userEmail: 'bat@test.com',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListCourseEnrollmentsUseCase,
        {
          provide: EnrollmentRepository,
          useValue: {
            findByCourseId: jest.fn(),
          },
        },
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListCourseEnrollmentsUseCase>(ListCourseEnrollmentsUseCase);
    enrollmentRepository = module.get(EnrollmentRepository);
    courseRepository = module.get(CourseRepository);
  });

  it('сургалтын эзэмшигч амжилттай жагсаалт авах', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByCourseId.mockResolvedValue({
      data: [mockEnrollment],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('course-id-1', 'instructor-id-1', 'TEACHER', {});

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('админ амжилттай жагсаалт авах', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByCourseId.mockResolvedValue({
      data: [mockEnrollment],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('course-id-1', 'other-user-id', 'ADMIN', {});

    expect(result.data).toHaveLength(1);
  });

  it('сургалт олдоогүй NotFoundException', async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', 'user-id', 'TEACHER', {}),
    ).rejects.toThrow(NotFoundException);
  });

  it('эрхгүй хэрэглэгч ForbiddenException', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);

    await expect(
      useCase.execute('course-id-1', 'other-user-id', 'TEACHER', {}),
    ).rejects.toThrow(ForbiddenException);
  });
});
