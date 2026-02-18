import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../../interface/controllers/notifications.controller';
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications.use-case';
import { GetUnreadCountUseCase } from '../../application/use-cases/get-unread-count.use-case';
import { MarkAsReadUseCase } from '../../application/use-cases/mark-as-read.use-case';
import { MarkAllReadUseCase } from '../../application/use-cases/mark-all-read.use-case';
import { DeleteNotificationUseCase } from '../../application/use-cases/delete-notification.use-case';
import { GetPreferencesUseCase } from '../../application/use-cases/get-preferences.use-case';
import { UpdatePreferencesUseCase } from '../../application/use-cases/update-preferences.use-case';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationPreferenceEntity } from '../../domain/entities/notification-preference.entity';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let listNotificationsUseCase: jest.Mocked<ListNotificationsUseCase>;
  let getUnreadCountUseCase: jest.Mocked<GetUnreadCountUseCase>;
  let markAsReadUseCase: jest.Mocked<MarkAsReadUseCase>;
  let markAllReadUseCase: jest.Mocked<MarkAllReadUseCase>;
  let deleteNotificationUseCase: jest.Mocked<DeleteNotificationUseCase>;
  let getPreferencesUseCase: jest.Mocked<GetPreferencesUseCase>;
  let updatePreferencesUseCase: jest.Mocked<UpdatePreferencesUseCase>;

  const now = new Date();
  const userId = 'user-1';

  /** Тестэд ашиглах mock мэдэгдэл */
  const mockNotification = new NotificationEntity({
    id: 'notif-1',
    userId,
    type: 'IN_APP',
    title: 'Test мэдэгдэл',
    message: 'Тест мэдэгдлийн агуулга',
    data: { courseId: 'course-1' },
    read: false,
    sentAt: now,
    readAt: null,
    createdAt: now,
  });

  /** Тестэд ашиглах mock тохиргоо */
  const mockPreference = new NotificationPreferenceEntity({
    id: 'pref-1',
    userId,
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    channelPreferences: {},
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: ListNotificationsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetUnreadCountUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: MarkAsReadUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: MarkAllReadUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteNotificationUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetPreferencesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdatePreferencesUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    listNotificationsUseCase = module.get(ListNotificationsUseCase);
    getUnreadCountUseCase = module.get(GetUnreadCountUseCase);
    markAsReadUseCase = module.get(MarkAsReadUseCase);
    markAllReadUseCase = module.get(MarkAllReadUseCase);
    deleteNotificationUseCase = module.get(DeleteNotificationUseCase);
    getPreferencesUseCase = module.get(GetPreferencesUseCase);
    updatePreferencesUseCase = module.get(UpdatePreferencesUseCase);
  });

  describe('getUnreadCount', () => {
    it('уншаагүй мэдэгдлийн тоо буцаах', async () => {
      getUnreadCountUseCase.execute.mockResolvedValue({ count: 5 });

      const result = await controller.getUnreadCount(userId);

      expect(result).toEqual({ count: 5 });
      expect(getUnreadCountUseCase.execute).toHaveBeenCalledWith(userId);
    });
  });

  describe('getPreferences', () => {
    it('тохиргоо toResponse хэлбэрээр буцаах', async () => {
      getPreferencesUseCase.execute.mockResolvedValue(mockPreference);

      const result = await controller.getPreferences(userId);

      expect(result).toEqual(mockPreference.toResponse());
      expect(getPreferencesUseCase.execute).toHaveBeenCalledWith(userId);
    });
  });

  describe('markAllRead', () => {
    it('бүх мэдэгдлийг уншсан болгоод тоо буцаах', async () => {
      markAllReadUseCase.execute.mockResolvedValue({ count: 3 });

      const result = await controller.markAllRead(userId);

      expect(result).toEqual({ count: 3 });
      expect(markAllReadUseCase.execute).toHaveBeenCalledWith(userId);
    });
  });

  describe('updatePreferences', () => {
    it('тохиргоо шинэчлээд toResponse буцаах', async () => {
      const dto = { emailEnabled: false };
      const updatedPref = new NotificationPreferenceEntity({
        ...mockPreference,
        emailEnabled: false,
      });
      updatePreferencesUseCase.execute.mockResolvedValue(updatedPref);

      const result = await controller.updatePreferences(userId, dto);

      expect(result).toEqual(updatedPref.toResponse());
      expect(updatePreferencesUseCase.execute).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('listNotifications', () => {
    it('мэдэгдлүүдийн жагсаалт toResponse-тэй буцаах', async () => {
      /** Use case-ийн буцаах утга */
      listNotificationsUseCase.execute.mockResolvedValue({
        data: [mockNotification],
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await controller.listNotifications(userId, {});

      expect(result).toEqual({
        data: [mockNotification.toResponse()],
        total: 1,
        page: 1,
        limit: 20,
      });
      expect(listNotificationsUseCase.execute).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 20,
        type: undefined,
        read: undefined,
      });
    });

    it('query параметрүүд зөв дамжуулагдах', async () => {
      listNotificationsUseCase.execute.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 10,
      });

      const result = await controller.listNotifications(userId, {
        page: 2,
        limit: 10,
        type: 'EMAIL' as any,
        read: true,
      });

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 2,
        limit: 10,
      });
      expect(listNotificationsUseCase.execute).toHaveBeenCalledWith(userId, {
        page: 2,
        limit: 10,
        type: 'EMAIL',
        read: true,
      });
    });
  });

  describe('markAsRead', () => {
    it('мэдэгдлийг уншсан болгож toResponse буцаах', async () => {
      const readNotification = new NotificationEntity({
        ...mockNotification,
        read: true,
        readAt: now,
      });
      markAsReadUseCase.execute.mockResolvedValue(readNotification);

      const result = await controller.markAsRead(userId, 'notif-1');

      expect(result).toEqual(readNotification.toResponse());
      expect(markAsReadUseCase.execute).toHaveBeenCalledWith('notif-1', userId);
    });
  });

  describe('deleteNotification', () => {
    it('мэдэгдэл устгаад амжилтын мессеж буцаах', async () => {
      deleteNotificationUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.deleteNotification(userId, 'STUDENT', 'notif-1');

      expect(result).toEqual({ message: 'Мэдэгдэл амжилттай устгагдлаа' });
      expect(deleteNotificationUseCase.execute).toHaveBeenCalledWith('notif-1', userId, 'STUDENT');
    });
  });
});
