import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from '../../interface/controllers/courses.controller';
import { CreateCourseUseCase } from '../../application/use-cases/create-course.use-case';
import { GetCourseUseCase } from '../../application/use-cases/get-course.use-case';
import { GetCourseBySlugUseCase } from '../../application/use-cases/get-course-by-slug.use-case';
import { UpdateCourseUseCase } from '../../application/use-cases/update-course.use-case';
import { PublishCourseUseCase } from '../../application/use-cases/publish-course.use-case';
import { ArchiveCourseUseCase } from '../../application/use-cases/archive-course.use-case';
import { ListCoursesUseCase } from '../../application/use-cases/list-courses.use-case';
import { ListMyCoursesUseCase } from '../../application/use-cases/list-my-courses.use-case';
import { DeleteCourseUseCase } from '../../application/use-cases/delete-course.use-case';
import { CourseEntity } from '../../domain/entities/course.entity';

describe('CoursesController', () => {
  let controller: CoursesController;
  let createCourseUseCase: jest.Mocked<CreateCourseUseCase>;
  let getCourseUseCase: jest.Mocked<GetCourseUseCase>;
  let getCourseBySlugUseCase: jest.Mocked<GetCourseBySlugUseCase>;
  let updateCourseUseCase: jest.Mocked<UpdateCourseUseCase>;
  let publishCourseUseCase: jest.Mocked<PublishCourseUseCase>;
  let archiveCourseUseCase: jest.Mocked<ArchiveCourseUseCase>;
  let listCoursesUseCase: jest.Mocked<ListCoursesUseCase>;
  let listMyCoursesUseCase: jest.Mocked<ListMyCoursesUseCase>;
  let deleteCourseUseCase: jest.Mocked<DeleteCourseUseCase>;

  /** Тестэд ашиглах mock сургалт */
  const mockCourse = new CourseEntity({
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
    tags: ['typescript'],
    instructorName: 'Бат Дорж',
    categoryName: 'Програмчлал',
  });

  /** Сургалтын response хэлбэр */
  const mockCourseResponse = mockCourse.toResponse();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CreateCourseUseCase, useValue: { execute: jest.fn() } },
        { provide: GetCourseUseCase, useValue: { execute: jest.fn() } },
        { provide: GetCourseBySlugUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateCourseUseCase, useValue: { execute: jest.fn() } },
        { provide: PublishCourseUseCase, useValue: { execute: jest.fn() } },
        { provide: ArchiveCourseUseCase, useValue: { execute: jest.fn() } },
        { provide: ListCoursesUseCase, useValue: { execute: jest.fn() } },
        { provide: ListMyCoursesUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteCourseUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    createCourseUseCase = module.get(CreateCourseUseCase);
    getCourseUseCase = module.get(GetCourseUseCase);
    getCourseBySlugUseCase = module.get(GetCourseBySlugUseCase);
    updateCourseUseCase = module.get(UpdateCourseUseCase);
    publishCourseUseCase = module.get(PublishCourseUseCase);
    archiveCourseUseCase = module.get(ArchiveCourseUseCase);
    listCoursesUseCase = module.get(ListCoursesUseCase);
    listMyCoursesUseCase = module.get(ListMyCoursesUseCase);
    deleteCourseUseCase = module.get(DeleteCourseUseCase);
  });

  describe('create', () => {
    it('POST /courses — сургалт үүсгэх', async () => {
      createCourseUseCase.execute.mockResolvedValue(mockCourse);

      const dto = {
        title: 'TypeScript Сургалт',
        description: 'TypeScript суралцах сургалт',
        categoryId: 'cat-id-1',
        difficulty: 'BEGINNER' as const,
      };
      const result = await controller.create('user-id-1', dto);

      expect(result).toEqual(mockCourseResponse);
      expect(createCourseUseCase.execute).toHaveBeenCalledWith('user-id-1', dto);
    });
  });

  describe('list', () => {
    it('GET /courses — жагсаалт авах', async () => {
      const mockListResult = {
        data: [mockCourseResponse],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      listCoursesUseCase.execute.mockResolvedValue(mockListResult);

      const query = { page: 1, limit: 20 };
      const result = await controller.list(query);

      expect(result).toEqual(mockListResult);
      expect(listCoursesUseCase.execute).toHaveBeenCalledWith(query);
    });
  });

  describe('listMyCourses', () => {
    it('GET /courses/my — миний сургалтууд', async () => {
      const mockListResult = {
        data: [mockCourseResponse],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      listMyCoursesUseCase.execute.mockResolvedValue(mockListResult);

      const query = { page: 1, limit: 20 };
      const result = await controller.listMyCourses('user-id-1', query);

      expect(result).toEqual(mockListResult);
      expect(listMyCoursesUseCase.execute).toHaveBeenCalledWith('user-id-1', query);
    });
  });

  describe('getBySlug', () => {
    it('GET /courses/slug/:slug — slug-аар авах', async () => {
      getCourseBySlugUseCase.execute.mockResolvedValue(mockCourse);

      const result = await controller.getBySlug('typescript-surgalt');

      expect(result).toEqual(mockCourseResponse);
      expect(getCourseBySlugUseCase.execute).toHaveBeenCalledWith('typescript-surgalt');
    });
  });

  describe('getById', () => {
    it('GET /courses/:id — ID-аар авах', async () => {
      getCourseUseCase.execute.mockResolvedValue(mockCourse);

      const result = await controller.getById('course-id-1');

      expect(result).toEqual(mockCourseResponse);
      expect(getCourseUseCase.execute).toHaveBeenCalledWith('course-id-1');
    });
  });

  describe('update', () => {
    it('PATCH /courses/:id — шинэчлэх', async () => {
      updateCourseUseCase.execute.mockResolvedValue(mockCourse);

      const dto = { description: 'Шинэчлэгдсэн' };
      const result = await controller.update('course-id-1', 'user-id-1', 'TEACHER', dto);

      expect(result).toEqual(mockCourseResponse);
      expect(updateCourseUseCase.execute).toHaveBeenCalledWith(
        'course-id-1',
        'user-id-1',
        'TEACHER',
        dto,
      );
    });
  });

  describe('publish', () => {
    it('PATCH /courses/:id/publish — нийтлэх', async () => {
      publishCourseUseCase.execute.mockResolvedValue(mockCourse);

      const result = await controller.publish('course-id-1', 'user-id-1', 'TEACHER');

      expect(result).toEqual(mockCourseResponse);
      expect(publishCourseUseCase.execute).toHaveBeenCalledWith(
        'course-id-1',
        'user-id-1',
        'TEACHER',
      );
    });
  });

  describe('archive', () => {
    it('PATCH /courses/:id/archive — архивлах', async () => {
      archiveCourseUseCase.execute.mockResolvedValue(mockCourse);

      const result = await controller.archive('course-id-1', 'user-id-1', 'TEACHER');

      expect(result).toEqual(mockCourseResponse);
      expect(archiveCourseUseCase.execute).toHaveBeenCalledWith(
        'course-id-1',
        'user-id-1',
        'TEACHER',
      );
    });
  });

  describe('delete', () => {
    it('DELETE /courses/:id — устгах', async () => {
      deleteCourseUseCase.execute.mockResolvedValue(undefined);

      await controller.delete('course-id-1');

      expect(deleteCourseUseCase.execute).toHaveBeenCalledWith('course-id-1');
    });
  });
});
