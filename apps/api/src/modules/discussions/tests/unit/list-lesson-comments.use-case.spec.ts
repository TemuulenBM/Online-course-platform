import { Test, TestingModule } from '@nestjs/testing';
import { ListLessonCommentsUseCase } from '../../application/use-cases/list-lesson-comments.use-case';
import { LessonCommentRepository } from '../../infrastructure/repositories/lesson-comment.repository';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';
import { LessonEntity } from '../../../lessons/domain/entities/lesson.entity';

describe('ListLessonCommentsUseCase', () => {
  let useCase: ListLessonCommentsUseCase;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let commentRepository: jest.Mocked<LessonCommentRepository>;

  const now = new Date();

  /** Тест өгөгдөл: хичээл */
  const mockLesson = new LessonEntity({
    id: 'lesson-id-1',
    courseId: 'course-id-1',
    title: 'Хичээл 1',
    orderIndex: 0,
    lessonType: 'VIDEO',
    durationMinutes: 30,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  });

  /** Тест өгөгдөл: сэтгэгдлүүд */
  const mockComments = [
    new LessonCommentEntity({
      id: 'comment-id-1',
      lessonId: 'lesson-id-1',
      userId: 'user-id-1',
      content: 'Эхний сэтгэгдэл',
      upvotes: 3,
      upvoterIds: ['user-id-2', 'user-id-3', 'user-id-4'],
      replies: [],
      isInstructorReply: false,
      createdAt: now,
      updatedAt: now,
    }),
    new LessonCommentEntity({
      id: 'comment-id-2',
      lessonId: 'lesson-id-1',
      userId: 'user-id-2',
      content: 'Хоёрдугаар сэтгэгдэл',
      upvotes: 0,
      upvoterIds: [],
      replies: [],
      isInstructorReply: false,
      createdAt: now,
      updatedAt: now,
    }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListLessonCommentsUseCase,
        {
          provide: LessonRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: LessonCommentRepository,
          useValue: {
            findByLessonId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListLessonCommentsUseCase>(ListLessonCommentsUseCase);
    lessonRepository = module.get(LessonRepository);
    commentRepository = module.get(LessonCommentRepository);
  });

  it('амжилттай жагсаалт авах', async () => {
    /** 2 сэтгэгдэлтэй жагсаалт амжилттай буцаах */
    lessonRepository.findById.mockResolvedValue(mockLesson);
    commentRepository.findByLessonId.mockResolvedValue({
      data: mockComments,
      total: 2,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('lesson-id-1', 'user-id-1', {
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    /** toResponse дуудагдсан эсэхийг шалгах — hasUpvoted талбар байна */
    expect(result.data[0]).toHaveProperty('hasUpvoted');
  });

  it('хоосон жагсаалт авах', async () => {
    /** Сэтгэгдэлгүй хичээлийн хоосон жагсаалт */
    lessonRepository.findById.mockResolvedValue(mockLesson);
    commentRepository.findByLessonId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('lesson-id-1', undefined, {
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('pagination зөв ажиллах', async () => {
    /** page=2, limit=1 дамжуулахад зөв дуудагдах */
    lessonRepository.findById.mockResolvedValue(mockLesson);
    commentRepository.findByLessonId.mockResolvedValue({
      data: [mockComments[1]],
      total: 2,
      page: 2,
      limit: 1,
    });

    const result = await useCase.execute('lesson-id-1', 'user-id-1', {
      page: 2,
      limit: 1,
      sortBy: 'newest',
    });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(2);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(1);
    expect(commentRepository.findByLessonId).toHaveBeenCalledWith('lesson-id-1', {
      page: 2,
      limit: 1,
      sortBy: 'newest',
    });
  });
});
