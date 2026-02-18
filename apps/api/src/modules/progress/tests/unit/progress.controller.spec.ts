import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from '../../interface/controllers/progress.controller';
import { UpdateLessonProgressUseCase } from '../../application/use-cases/update-lesson-progress.use-case';
import { CompleteLessonUseCase } from '../../application/use-cases/complete-lesson.use-case';
import { GetLessonProgressUseCase } from '../../application/use-cases/get-lesson-progress.use-case';
import { GetCourseProgressUseCase } from '../../application/use-cases/get-course-progress.use-case';
import { ListMyProgressUseCase } from '../../application/use-cases/list-my-progress.use-case';
import { UpdateVideoPositionUseCase } from '../../application/use-cases/update-video-position.use-case';
import { DeleteProgressUseCase } from '../../application/use-cases/delete-progress.use-case';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';

describe('ProgressController', () => {
  let controller: ProgressController;
  let updateLessonProgressUseCase: jest.Mocked<UpdateLessonProgressUseCase>;
  let completeLessonUseCase: jest.Mocked<CompleteLessonUseCase>;
  let getLessonProgressUseCase: jest.Mocked<GetLessonProgressUseCase>;
  let getCourseProgressUseCase: jest.Mocked<GetCourseProgressUseCase>;
  let listMyProgressUseCase: jest.Mocked<ListMyProgressUseCase>;
  let updateVideoPositionUseCase: jest.Mocked<UpdateVideoPositionUseCase>;
  let deleteProgressUseCase: jest.Mocked<DeleteProgressUseCase>;

  const now = new Date();

  const mockProgress = new UserProgressEntity({
    id: 'progress-id-1',
    userId: 'user-id-1',
    lessonId: 'lesson-id-1',
    progressPercentage: 50,
    completed: false,
    timeSpentSeconds: 300,
    lastPositionSeconds: 150,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    lessonTitle: 'Хичээл 1',
    lessonType: 'video',
    courseId: 'course-id-1',
    lessonOrderIndex: 0,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        {
          provide: UpdateLessonProgressUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CompleteLessonUseCase, useValue: { execute: jest.fn() } },
        { provide: GetLessonProgressUseCase, useValue: { execute: jest.fn() } },
        {
          provide: GetCourseProgressUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: ListMyProgressUseCase, useValue: { execute: jest.fn() } },
        {
          provide: UpdateVideoPositionUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: DeleteProgressUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ProgressController>(ProgressController);
    updateLessonProgressUseCase = module.get(UpdateLessonProgressUseCase);
    completeLessonUseCase = module.get(CompleteLessonUseCase);
    getLessonProgressUseCase = module.get(GetLessonProgressUseCase);
    getCourseProgressUseCase = module.get(GetCourseProgressUseCase);
    listMyProgressUseCase = module.get(ListMyProgressUseCase);
    updateVideoPositionUseCase = module.get(UpdateVideoPositionUseCase);
    deleteProgressUseCase = module.get(DeleteProgressUseCase);
  });

  it('GET /progress/my — Миний ахицуудын жагсаалт авах', async () => {
    const mockResult = {
      data: [mockProgress.toResponse()],
      total: 1,
      page: 1,
      limit: 20,
    };
    listMyProgressUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.listMyProgress('user-id-1', {
      page: 1,
      limit: 20,
    });

    expect(result).toEqual(mockResult);
    expect(listMyProgressUseCase.execute).toHaveBeenCalledWith('user-id-1', {
      page: 1,
      limit: 20,
    });
  });

  it('GET /progress/course/:courseId — Сургалтын ахицын нэгтгэл авах', async () => {
    const mockResult = {
      courseId: 'course-id-1',
      totalLessons: 5,
      completedLessons: 2,
      courseProgressPercentage: 40,
      courseCompleted: false,
      totalTimeSpentSeconds: 600,
      lessons: [],
    };
    getCourseProgressUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.getCourseProgress('user-id-1', 'course-id-1');

    expect(result).toEqual(mockResult);
    expect(getCourseProgressUseCase.execute).toHaveBeenCalledWith('user-id-1', 'course-id-1');
  });

  it('GET /progress/lessons/:lessonId — Хичээлийн ахиц авах', async () => {
    getLessonProgressUseCase.execute.mockResolvedValue(mockProgress.toResponse());

    const result = await controller.getLessonProgress('user-id-1', 'lesson-id-1');

    expect(result).toEqual(mockProgress.toResponse());
    expect(getLessonProgressUseCase.execute).toHaveBeenCalledWith('user-id-1', 'lesson-id-1');
  });

  it('POST /progress/lessons/:lessonId — Хичээлийн ахиц шинэчлэх', async () => {
    updateLessonProgressUseCase.execute.mockResolvedValue(mockProgress);

    const dto = { progressPercentage: 50, timeSpentSeconds: 120 };
    const result = await controller.updateLessonProgress('user-id-1', 'lesson-id-1', dto);

    expect(result).toEqual(mockProgress.toResponse());
    expect(updateLessonProgressUseCase.execute).toHaveBeenCalledWith(
      'user-id-1',
      'lesson-id-1',
      dto,
    );
  });

  it('POST /progress/lessons/:lessonId/complete — Хичээл дуусгах', async () => {
    const completedProgress = new UserProgressEntity({
      ...mockProgress,
      progressPercentage: 100,
      completed: true,
      completedAt: now,
    } as any);
    completeLessonUseCase.execute.mockResolvedValue({
      progress: completedProgress,
      courseCompleted: false,
    });

    const result = await controller.completeLesson('user-id-1', 'lesson-id-1');

    expect(result).toEqual({
      ...completedProgress.toResponse(),
      courseCompleted: false,
    });
    expect(completeLessonUseCase.execute).toHaveBeenCalledWith('user-id-1', 'lesson-id-1');
  });

  it('PATCH /progress/lessons/:lessonId/position — Видеоны байрлал шинэчлэх', async () => {
    const updatedProgress = new UserProgressEntity({
      ...mockProgress,
      lastPositionSeconds: 300,
    } as any);
    updateVideoPositionUseCase.execute.mockResolvedValue(updatedProgress);

    const dto = { lastPositionSeconds: 300, timeSpentSeconds: 60 };
    const result = await controller.updateVideoPosition('user-id-1', 'lesson-id-1', dto);

    expect(result).toEqual(updatedProgress.toResponse());
    expect(updateVideoPositionUseCase.execute).toHaveBeenCalledWith(
      'user-id-1',
      'lesson-id-1',
      dto,
    );
  });

  it('DELETE /progress/:id — Ахиц устгах', async () => {
    deleteProgressUseCase.execute.mockResolvedValue(undefined);

    await controller.deleteProgress('progress-id-1');

    expect(deleteProgressUseCase.execute).toHaveBeenCalledWith('progress-id-1');
  });
});
