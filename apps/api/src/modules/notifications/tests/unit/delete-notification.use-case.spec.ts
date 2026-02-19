import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteNotificationUseCase } from '../../application/use-cases/delete-notification.use-case';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';
import { NotificationEntity } from '../../domain/entities/notification.entity';

describe('DeleteNotificationUseCase', () => {
  let useCase: DeleteNotificationUseCase;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let cacheService: jest.Mocked<NotificationCacheService>;

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
        DeleteNotificationUseCase,
        {
          provide: NotificationRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
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

    useCase = module.get<DeleteNotificationUseCase>(DeleteNotificationUseCase);
    notificationRepository = module.get(NotificationRepository);
    cacheService = module.get(NotificationCacheService);
  });

  it('мэдэгдэл олдоогүй бол NotFoundException', async () => {
    /** DB-д мэдэгдэл олдохгүй бол NotFoundException шидэх */
    notificationRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('notif-999', 'user-1', 'STUDENT')).rejects.toThrow(
      NotFoundException,
    );
    expect(notificationRepository.findById).toHaveBeenCalledWith('notif-999');
  });

  it('өөрийн биш ADMIN биш бол ForbiddenException', async () => {
    /** Бусдын мэдэгдлийг STUDENT устгах гэвэл ForbiddenException */
    notificationRepository.findById.mockResolvedValue(mockNotification);

    await expect(useCase.execute('notif-1', 'user-999', 'STUDENT')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('ADMIN устгаж болох', async () => {
    /** ADMIN нь бусдын мэдэгдлийг устгах эрхтэй */
    notificationRepository.findById.mockResolvedValue(mockNotification);
    notificationRepository.delete.mockResolvedValue(undefined);
    cacheService.invalidateNotification.mockResolvedValue(undefined);
    cacheService.invalidateUnreadCount.mockResolvedValue(undefined);

    await useCase.execute('notif-1', 'admin-user', 'ADMIN');

    expect(notificationRepository.delete).toHaveBeenCalledWith('notif-1');
    expect(cacheService.invalidateNotification).toHaveBeenCalledWith('notif-1');
    expect(cacheService.invalidateUnreadCount).toHaveBeenCalledWith('user-1');
  });

  it('амжилттай устгаж кэш invalidate хийх', async () => {
    /** Эзэмшигч мэдэгдлээ устгаж, кэш invalidate хийгдэх */
    notificationRepository.findById.mockResolvedValue(mockNotification);
    notificationRepository.delete.mockResolvedValue(undefined);
    cacheService.invalidateNotification.mockResolvedValue(undefined);
    cacheService.invalidateUnreadCount.mockResolvedValue(undefined);

    await useCase.execute('notif-1', 'user-1', 'STUDENT');

    expect(notificationRepository.delete).toHaveBeenCalledWith('notif-1');
    expect(cacheService.invalidateNotification).toHaveBeenCalledWith('notif-1');
    expect(cacheService.invalidateUnreadCount).toHaveBeenCalledWith('user-1');
  });
});
