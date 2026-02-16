import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PublishCourseUseCase } from '../../application/use-cases/publish-course.use-case';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CourseEntity } from '../../domain/entities/course.entity';

describe('PublishCourseUseCase', () => {
  let useCase: PublishCourseUseCase;
  let courseRepository: jest.Mocked<CourseRepository>;
  let courseCacheService: jest.Mocked<CourseCacheService>;

  const mockDraftCourse = new CourseEntity({
    id: 'course-id-1',
    title: 'TypeScript Сургалт',
    slug: 'typescript-surgalt',
    description: 'TypeScript суралцах сургалт',
    instructorId: 'user-id-1',
    categoryId: 'cat-id-1',
    price: 29900,
    discountPrice: null,
    difficulty: 'beginner',
    language: 'mn',
    status: 'draft',
    thumbnailUrl: null,
    durationMinutes: 0,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockPublishedCourse = new CourseEntity({
    ...mockDraftCourse,
    status: 'published',
    publishedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishCourseUseCase,
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CourseCacheService,
          useValue: {
            invalidateCourse: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<PublishCourseUseCase>(PublishCourseUseCase);
    courseRepository = module.get(CourseRepository);
    courseCacheService = module.get(CourseCacheService);
  });

  it('DRAFT сургалтыг амжилттай нийтлэх', async () => {
    courseRepository.findById.mockResolvedValue(mockDraftCourse);
    courseRepository.update.mockResolvedValue(mockPublishedCourse);
    courseCacheService.invalidateCourse.mockResolvedValue(undefined);

    const result = await useCase.execute('course-id-1', 'user-id-1', 'TEACHER');

    expect(result.status).toBe('published');
    expect(courseRepository.update).toHaveBeenCalledWith('course-id-1', expect.objectContaining({
      status: 'published',
    }));
    expect(courseCacheService.invalidateCourse).toHaveBeenCalledWith('course-id-1');
  });

  it('PUBLISHED сургалтыг дахин нийтлэх боломжгүй', async () => {
    const publishedCourse = new CourseEntity({ ...mockDraftCourse, status: 'published', publishedAt: new Date() });
    courseRepository.findById.mockResolvedValue(publishedCourse);

    await expect(
      useCase.execute('course-id-1', 'user-id-1', 'TEACHER'),
    ).rejects.toThrow(ConflictException);
  });

  it('ARCHIVED сургалтыг нийтлэх боломжгүй', async () => {
    const archivedCourse = new CourseEntity({ ...mockDraftCourse, status: 'archived' });
    courseRepository.findById.mockResolvedValue(archivedCourse);

    await expect(
      useCase.execute('course-id-1', 'user-id-1', 'TEACHER'),
    ).rejects.toThrow(ConflictException);
  });

  it('эрхгүй хэрэглэгч нийтлэх оролдлого', async () => {
    courseRepository.findById.mockResolvedValue(mockDraftCourse);

    await expect(
      useCase.execute('course-id-1', 'other-user', 'TEACHER'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('сургалт олдоогүй', async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', 'user-id-1', 'TEACHER'),
    ).rejects.toThrow(NotFoundException);
  });
});
