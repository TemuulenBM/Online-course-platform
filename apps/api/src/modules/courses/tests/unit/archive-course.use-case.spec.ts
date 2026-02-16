import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { ArchiveCourseUseCase } from '../../application/use-cases/archive-course.use-case';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CourseEntity } from '../../domain/entities/course.entity';

describe('ArchiveCourseUseCase', () => {
  let useCase: ArchiveCourseUseCase;
  let courseRepository: jest.Mocked<CourseRepository>;
  let courseCacheService: jest.Mocked<CourseCacheService>;

  const mockPublishedCourse = new CourseEntity({
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
    status: 'published',
    thumbnailUrl: null,
    durationMinutes: 0,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockArchivedCourse = new CourseEntity({
    ...mockPublishedCourse,
    status: 'archived',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArchiveCourseUseCase,
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

    useCase = module.get<ArchiveCourseUseCase>(ArchiveCourseUseCase);
    courseRepository = module.get(CourseRepository);
    courseCacheService = module.get(CourseCacheService);
  });

  it('PUBLISHED сургалтыг амжилттай архивлах', async () => {
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);
    courseRepository.update.mockResolvedValue(mockArchivedCourse);
    courseCacheService.invalidateCourse.mockResolvedValue(undefined);

    const result = await useCase.execute('course-id-1', 'user-id-1', 'TEACHER');

    expect(result.status).toBe('archived');
    expect(courseRepository.update).toHaveBeenCalledWith('course-id-1', { status: 'archived' });
    expect(courseCacheService.invalidateCourse).toHaveBeenCalledWith('course-id-1');
  });

  it('DRAFT сургалтыг архивлах боломжгүй', async () => {
    const draftCourse = new CourseEntity({ ...mockPublishedCourse, status: 'draft', publishedAt: null });
    courseRepository.findById.mockResolvedValue(draftCourse);

    await expect(
      useCase.execute('course-id-1', 'user-id-1', 'TEACHER'),
    ).rejects.toThrow(ConflictException);
  });

  it('эрхгүй хэрэглэгч архивлах оролдлого', async () => {
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);

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
