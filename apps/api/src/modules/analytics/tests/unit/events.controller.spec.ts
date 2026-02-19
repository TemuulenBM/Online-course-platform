import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from '../../interface/controllers/events.controller';
import { TrackEventUseCase } from '../../application/use-cases/track-event.use-case';
import { ListEventsUseCase } from '../../application/use-cases/list-events.use-case';

describe('EventsController', () => {
  let controller: EventsController;
  let trackEventUseCase: jest.Mocked<TrackEventUseCase>;
  let listEventsUseCase: jest.Mocked<ListEventsUseCase>;

  /** Тестэд ашиглах mock event жагсаалт */
  const mockListResult = {
    data: [
      {
        id: 'event-1',
        userId: 'user-1',
        eventName: 'page_view',
        eventCategory: 'learning',
        properties: { courseId: 'course-1' },
        sessionId: 'session-123',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date().toISOString(),
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: TrackEventUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListEventsUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    trackEventUseCase = module.get(TrackEventUseCase);
    listEventsUseCase = module.get(ListEventsUseCase);
  });

  it('controller тодорхойлогдсон байх', () => {
    expect(controller).toBeDefined();
  });

  describe('trackEvent', () => {
    it('dto болон request context-г TrackEventUseCase-д зөв дамжуулах', async () => {
      trackEventUseCase.execute.mockResolvedValue({ queued: true });

      const dto = {
        eventName: 'page_view',
        eventCategory: 'learning',
        properties: { courseId: 'course-1' },
        sessionId: 'session-123',
      };

      /** Mock Express Request объект */
      const mockRequest = {
        user: { id: 'user-1' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'Mozilla/5.0' },
      } as any;

      const result = await controller.trackEvent(dto, mockRequest);

      expect(trackEventUseCase.execute).toHaveBeenCalledWith(dto, {
        userId: 'user-1',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });
      expect(result).toEqual({ queued: true });
    });

    it('хэрэглэгч нэвтрээгүй бол userId null дамжуулах', async () => {
      trackEventUseCase.execute.mockResolvedValue({ queued: true });

      const dto = {
        eventName: 'page_view',
        eventCategory: 'learning',
      };

      /** Нэвтрээгүй хэрэглэгчийн mock request */
      const mockRequest = {
        user: undefined,
        ip: '192.168.1.1',
        headers: { 'user-agent': 'Chrome' },
      } as any;

      const result = await controller.trackEvent(dto, mockRequest);

      expect(trackEventUseCase.execute).toHaveBeenCalledWith(dto, {
        userId: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Chrome',
      });
      expect(result).toEqual({ queued: true });
    });

    it('ip болон user-agent байхгүй бол null дамжуулах', async () => {
      trackEventUseCase.execute.mockResolvedValue({ queued: true });

      const dto = {
        eventName: 'video_play',
        eventCategory: 'learning',
      };

      /** IP болон User-Agent байхгүй mock request */
      const mockRequest = {
        user: undefined,
        ip: undefined,
        headers: {},
      } as any;

      const result = await controller.trackEvent(dto, mockRequest);

      expect(trackEventUseCase.execute).toHaveBeenCalledWith(dto, {
        userId: null,
        ipAddress: null,
        userAgent: null,
      });
      expect(result).toEqual({ queued: true });
    });
  });

  describe('listEvents', () => {
    it('query параметрүүдийг ListEventsUseCase-д зөв дамжуулах', async () => {
      listEventsUseCase.execute.mockResolvedValue(mockListResult);

      const query = {
        page: 2,
        limit: 10,
        eventName: 'page_view',
        eventCategory: 'learning',
        userId: 'user-1',
        dateFrom: '2026-01-01',
        dateTo: '2026-02-28',
      };

      const result = await controller.listEvents(query);

      expect(listEventsUseCase.execute).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        eventName: 'page_view',
        eventCategory: 'learning',
        userId: 'user-1',
        dateFrom: '2026-01-01',
        dateTo: '2026-02-28',
      });
      expect(result).toEqual(mockListResult);
    });

    it('query параметр байхгүй бол default утгууд дамжуулах', async () => {
      listEventsUseCase.execute.mockResolvedValue(mockListResult);

      const query = {
        page: undefined,
        limit: undefined,
        eventName: undefined,
        eventCategory: undefined,
        userId: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      };

      const result = await controller.listEvents(query as any);

      expect(listEventsUseCase.execute).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        eventName: undefined,
        eventCategory: undefined,
        userId: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      });
      expect(result).toEqual(mockListResult);
    });
  });
});
