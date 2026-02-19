import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MarkAsReadUseCase } from '../../application/use-cases/mark-as-read.use-case';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';
import { NotificationEntity } from '../../domain/entities/notification.entity';

describe('MarkAsReadUseCase', () => {
  let useCase: MarkAsReadUseCase;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let cacheService: jest.Mocked<NotificationCacheService>;

  const now = new Date();

  /** Тестэд ашиглах mock мэдэгдэл — уншаагүй */
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

  /** Уншсан мэдэгдэл */
  const mockReadNotification = new NotificationEntity({
    id: 'notif-1',
    userId: 'user-1',
    type: 'IN_APP',
    title: 'Test мэдэгдэл',
    message: 'Тест мэдэгдлийн агуулга',
    data: { courseId: 'course-1' },
    read: true,
    sentAt: now,
    readAt: now,
    createdAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkAsReadUseCase,
        {
          provide: NotificationRepository,
          useValue: {
            findById: jest.fn(),
            markAsRead: jest.fn(),
          },
        },
        {
          provide: NotificationCacheService,
          useValue: {
            invalidateNotification: jest.fn(),
            invalidateUnreadCount: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<MarkAsReadUseCase>(MarkAsReadUseCase);
    notificationRepository = module.get(NotificationRepository);
    cacheService = module.get(NotificationCacheService);
  });

  it('мэдэгдэл олдоогүй бол NotFoundException', async () => {
    /** Мэдэгдэл DB-д олдохгүй тохиолдолд NotFoundException шидэх */
    notificationRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('notif-999', 'user-1')).rejects.toThrow(NotFoundException);
    expect(notificationRepository.findById).toHaveBeenCalledWith('notif-999');
  });

  it('өөрийн биш бол ForbiddenException', async () => {
    /** Бусдын мэдэгдлийг уншсан болгохыг оролдвол ForbiddenException */
    notificationRepository.findById.mockResolvedValue(mockNotification);

    await expect(useCase.execute('notif-1', 'user-999')).rejects.toThrow(ForbiddenException);
  });

  it('аль хэдийн уншсан бол шууд буцаах', async () => {
    /** Уншсан мэдэгдлийг дахин уншсан болгох шаардлагагүй — шууд буцаана */
    notificationRepository.findById.mockResolvedValue(mockReadNotification);

    const result = await useCase.execute('notif-1', 'user-1');

    expect(result).toEqual(mockReadNotification);
    /** markAsRead дуудагдаагүй байх — шаардлагагүй тул */
    expect(notificationRepository.markAsRead).not.toHaveBeenCalled();
  });

  it('амжилттай уншсан болгож кэш invalidate хийх', async () => {
    /** Уншаагүй мэдэгдлийг уншсан болгож, кэш invalidate хийх */
    notificationRepository.findById.mockResolvedValue(mockNotification);
    notificationRepository.markAsRead.mockResolvedValue(mockReadNotification);
    cacheService.invalidateNotification.mockResolvedValue(undefined);
    cacheService.invalidateUnreadCount.mockResolvedValue(undefined);

    const result = await useCase.execute('notif-1', 'user-1');

    expect(result).toEqual(mockReadNotification);
    expect(notificationRepository.markAsRead).toHaveBeenCalledWith('notif-1');
    expect(cacheService.invalidateNotification).toHaveBeenCalledWith('notif-1');
    expect(cacheService.invalidateUnreadCount).toHaveBeenCalledWith('user-1');
  });
});
