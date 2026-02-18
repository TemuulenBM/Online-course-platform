import { Test, TestingModule } from '@nestjs/testing';
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications.use-case';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';

describe('ListNotificationsUseCase', () => {
  let useCase: ListNotificationsUseCase;
  let notificationRepository: jest.Mocked<NotificationRepository>;

  const now = new Date();

  /** Тестэд ашиглах mock мэдэгдэл */
  const mockNotification = new NotificationEntity({
    id: 'notif-1',
    userId: 'user-1',
    type: 'IN_APP',
    title: 'Test мэдэгдэл',
    message: 'Тест мэдэгдлийн агуулга',
    data: { courseId: 'course-1' },
    read: false,
    sentAt: now,
    readAt: null,
    createdAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListNotificationsUseCase,
        {
          provide: NotificationRepository,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListNotificationsUseCase>(ListNotificationsUseCase);
    notificationRepository = module.get(NotificationRepository);
  });

  it('мэдэгдлүүдийн жагсаалт pagination-тэй буцаах', async () => {
    /** Repository-д mock утга тохируулах */
    const mockResult = {
      data: [mockNotification],
      total: 1,
      page: 1,
      limit: 20,
    };
    notificationRepository.findByUserId.mockResolvedValue(mockResult);

    const result = await useCase.execute('user-1', { page: 1, limit: 20 });

    expect(result).toEqual(mockResult);
    expect(notificationRepository.findByUserId).toHaveBeenCalledWith('user-1', {
      page: 1,
      limit: 20,
    });
  });

  it('type filter-ээр шүүх', async () => {
    /** Type параметр дамжуулсан тохиолдолд repository-д зөв дамжуулагдах */
    const mockResult = {
      data: [mockNotification],
      total: 1,
      page: 1,
      limit: 20,
    };
    notificationRepository.findByUserId.mockResolvedValue(mockResult);

    const result = await useCase.execute('user-1', {
      page: 1,
      limit: 20,
      type: 'IN_APP',
    });

    expect(result).toEqual(mockResult);
    expect(notificationRepository.findByUserId).toHaveBeenCalledWith('user-1', {
      page: 1,
      limit: 20,
      type: 'IN_APP',
    });
  });

  it('read filter-ээр шүүх', async () => {
    /** Read параметр дамжуулсан тохиолдолд repository-д зөв дамжуулагдах */
    const mockResult = {
      data: [mockNotification],
      total: 1,
      page: 1,
      limit: 20,
    };
    notificationRepository.findByUserId.mockResolvedValue(mockResult);

    const result = await useCase.execute('user-1', {
      page: 1,
      limit: 20,
      read: false,
    });

    expect(result).toEqual(mockResult);
    expect(notificationRepository.findByUserId).toHaveBeenCalledWith('user-1', {
      page: 1,
      limit: 20,
      read: false,
    });
  });
});
