import { Test, TestingModule } from '@nestjs/testing';
import { ListEventsUseCase } from '../../application/use-cases/list-events.use-case';
import { AnalyticsEventRepository } from '../../infrastructure/repositories/analytics-event.repository';
import { AnalyticsEventEntity } from '../../domain/entities/analytics-event.entity';

describe('ListEventsUseCase', () => {
  let useCase: ListEventsUseCase;
  let analyticsEventRepository: jest.Mocked<AnalyticsEventRepository>;

  const now = new Date();

  /** Тестэд ашиглах mock event-ууд */
  const mockEvents = [
    new AnalyticsEventEntity({
      id: 'event-1',
      userId: 'user-1',
      eventName: 'page_view',
      eventCategory: 'learning',
      properties: { courseId: 'course-1' },
      sessionId: 'session-1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: now,
    }),
    new AnalyticsEventEntity({
      id: 'event-2',
      userId: 'user-2',
      eventName: 'video_play',
      eventCategory: 'learning',
      properties: { lessonId: 'lesson-1' },
      sessionId: 'session-2',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome/120',
      createdAt: now,
    }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListEventsUseCase,
        {
          provide: AnalyticsEventRepository,
          useValue: {
            findMany: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListEventsUseCase>(ListEventsUseCase);
    analyticsEventRepository = module.get(AnalyticsEventRepository);
  });

  it('pagination-тэй event жагсаалт буцаах', async () => {
    analyticsEventRepository.findMany.mockResolvedValue({
      data: mockEvents,
      total: 2,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result).toEqual({
      data: mockEvents.map((e) => e.toResponse()),
      total: 2,
      page: 1,
      limit: 20,
    });
    expect(analyticsEventRepository.findMany).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      eventName: undefined,
      eventCategory: undefined,
      userId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it('filter-үүдийг зөв дамжуулах', async () => {
    analyticsEventRepository.findMany.mockResolvedValue({
      data: [mockEvents[0]],
      total: 1,
      page: 1,
      limit: 10,
    });

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      eventName: 'page_view',
      eventCategory: 'learning',
      userId: 'user-1',
      dateFrom: '2025-01-01',
      dateTo: '2025-12-31',
    });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(analyticsEventRepository.findMany).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      eventName: 'page_view',
      eventCategory: 'learning',
      userId: 'user-1',
      dateFrom: expect.any(Date),
      dateTo: expect.any(Date),
    });
  });

  it('хоосон жагсаалт буцаах боломжтой', async () => {
    analyticsEventRepository.findMany.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('dateFrom болон dateTo-г Date руу хөрвүүлэх', async () => {
    analyticsEventRepository.findMany.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await useCase.execute({
      page: 1,
      limit: 10,
      dateFrom: '2025-06-01',
      dateTo: '2025-06-30',
    });

    const calledArgs = analyticsEventRepository.findMany.mock.calls[0][0];
    expect(calledArgs.dateFrom).toBeInstanceOf(Date);
    expect(calledArgs.dateTo).toBeInstanceOf(Date);
  });
});
