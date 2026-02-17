import { Test, TestingModule } from '@nestjs/testing';
import { LessonsController } from '../../interface/controllers/lessons.controller';
import { CreateLessonUseCase } from '../../application/use-cases/create-lesson.use-case';
import { GetLessonUseCase } from '../../application/use-cases/get-lesson.use-case';
import { ListLessonsUseCase } from '../../application/use-cases/list-lessons.use-case';
import { UpdateLessonUseCase } from '../../application/use-cases/update-lesson.use-case';
import { TogglePublishLessonUseCase } from '../../application/use-cases/toggle-publish-lesson.use-case';
import { ReorderLessonsUseCase } from '../../application/use-cases/reorder-lessons.use-case';
import { DeleteLessonUseCase } from '../../application/use-cases/delete-lesson.use-case';
import { LessonEntity } from '../../domain/entities/lesson.entity';

describe('LessonsController', () => {
  let controller: LessonsController;
  let createLessonUseCase: jest.Mocked<CreateLessonUseCase>;
  let getLessonUseCase: jest.Mocked<GetLessonUseCase>;
  let listLessonsUseCase: jest.Mocked<ListLessonsUseCase>;
  let updateLessonUseCase: jest.Mocked<UpdateLessonUseCase>;
  let togglePublishLessonUseCase: jest.Mocked<TogglePublishLessonUseCase>;
  let reorderLessonsUseCase: jest.Mocked<ReorderLessonsUseCase>;
  let deleteLessonUseCase: jest.Mocked<DeleteLessonUseCase>;

  /** Тестэд ашиглах mock хичээл */
  const mockLesson = new LessonEntity({
    id: 'lesson-id-1',
    courseId: 'course-id-1',
    title: 'React-ийн суурь ойлголтууд',
    orderIndex: 0,
    lessonType: 'video',
    durationMinutes: 30,
    isPreview: false,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    courseTitle: 'TypeScript Сургалт',
    courseInstructorId: 'user-id-1',
  });

  /** Хичээлийн response хэлбэр */
  const mockLessonResponse = mockLesson.toResponse();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        { provide: CreateLessonUseCase, useValue: { execute: jest.fn() } },
        { provide: GetLessonUseCase, useValue: { execute: jest.fn() } },
        { provide: ListLessonsUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateLessonUseCase, useValue: { execute: jest.fn() } },
        {
          provide: TogglePublishLessonUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: ReorderLessonsUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteLessonUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<LessonsController>(LessonsController);
    createLessonUseCase = module.get(CreateLessonUseCase);
    getLessonUseCase = module.get(GetLessonUseCase);
    listLessonsUseCase = module.get(ListLessonsUseCase);
    updateLessonUseCase = module.get(UpdateLessonUseCase);
    togglePublishLessonUseCase = module.get(TogglePublishLessonUseCase);
    reorderLessonsUseCase = module.get(ReorderLessonsUseCase);
    deleteLessonUseCase = module.get(DeleteLessonUseCase);
  });

  describe('create', () => {
    it('POST /lessons — хичээл үүсгэх', async () => {
      createLessonUseCase.execute.mockResolvedValue(mockLesson);

      const dto = {
        title: 'React-ийн суурь ойлголтууд',
        courseId: 'course-id-1',
        lessonType: 'video',
        durationMinutes: 30,
      };
      const result = await controller.create('user-id-1', 'TEACHER', dto);

      expect(result).toEqual(mockLessonResponse);
      expect(createLessonUseCase.execute).toHaveBeenCalledWith('user-id-1', 'TEACHER', dto);
    });
  });

  describe('listByCourse', () => {
    it('GET /lessons/course/:courseId — сургалтын хичээлүүдийн жагсаалт', async () => {
      const mockListResult = [mockLessonResponse];
      listLessonsUseCase.execute.mockResolvedValue(mockListResult);

      const query = {};
      const result = await controller.listByCourse('course-id-1', query, 'user-id-1', 'TEACHER');

      expect(result).toEqual(mockListResult);
      expect(listLessonsUseCase.execute).toHaveBeenCalledWith('course-id-1', {
        currentUserId: 'user-id-1',
        currentUserRole: 'TEACHER',
        publishedOnly: undefined,
      });
    });
  });

  describe('reorder', () => {
    it('PATCH /lessons/reorder — хичээлүүдийн дараалал өөрчлөх', async () => {
      reorderLessonsUseCase.execute.mockResolvedValue(undefined);

      const dto = {
        courseId: 'course-id-1',
        items: [
          { lessonId: 'lesson-id-1', orderIndex: 1 },
          { lessonId: 'lesson-id-2', orderIndex: 0 },
        ],
      };
      await controller.reorder('user-id-1', 'TEACHER', dto);

      expect(reorderLessonsUseCase.execute).toHaveBeenCalledWith('user-id-1', 'TEACHER', dto);
    });
  });

  describe('getById', () => {
    it('GET /lessons/:id — хичээлийн дэлгэрэнгүй', async () => {
      getLessonUseCase.execute.mockResolvedValue(mockLesson);

      const result = await controller.getById('lesson-id-1');

      expect(result).toEqual(mockLessonResponse);
      expect(getLessonUseCase.execute).toHaveBeenCalledWith('lesson-id-1');
    });
  });

  describe('update', () => {
    it('PATCH /lessons/:id — хичээл шинэчлэх', async () => {
      updateLessonUseCase.execute.mockResolvedValue(mockLesson);

      const dto = { title: 'Шинэчлэгдсэн нэр' };
      const result = await controller.update('lesson-id-1', 'user-id-1', 'TEACHER', dto);

      expect(result).toEqual(mockLessonResponse);
      expect(updateLessonUseCase.execute).toHaveBeenCalledWith(
        'lesson-id-1',
        'user-id-1',
        'TEACHER',
        dto,
      );
    });
  });

  describe('togglePublish', () => {
    it('PATCH /lessons/:id/publish — нийтлэлт солих', async () => {
      togglePublishLessonUseCase.execute.mockResolvedValue(mockLesson);

      const result = await controller.togglePublish('lesson-id-1', 'user-id-1', 'TEACHER');

      expect(result).toEqual(mockLessonResponse);
      expect(togglePublishLessonUseCase.execute).toHaveBeenCalledWith(
        'lesson-id-1',
        'user-id-1',
        'TEACHER',
      );
    });
  });

  describe('delete', () => {
    it('DELETE /lessons/:id — хичээл устгах', async () => {
      deleteLessonUseCase.execute.mockResolvedValue(undefined);

      await controller.delete('lesson-id-1', 'user-id-1', 'TEACHER');

      expect(deleteLessonUseCase.execute).toHaveBeenCalledWith(
        'lesson-id-1',
        'user-id-1',
        'TEACHER',
      );
    });
  });
});
