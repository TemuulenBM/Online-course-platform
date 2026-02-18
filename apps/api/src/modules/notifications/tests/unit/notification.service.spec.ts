import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import { NotificationService } from '../../application/services/notification.service';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationPreferenceRepository } from '../../infrastructure/repositories/notification-preference.repository';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationPreferenceEntity } from '../../domain/entities/notification-preference.entity';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let preferenceRepository: jest.Mocked<NotificationPreferenceRepository>;
  let cacheService: jest.Mocked<NotificationCacheService>;
  let notificationQueue: { add: jest.Mock };
  let configService: jest.Mocked<ConfigService>;

  const now = new Date();

  /** Тестэд ашиглах mock мэдэгдэл */
  const mockNotification = new NotificationEntity({
    id: 'notif-1',
    userId: 'user-1',
    type: 'IN_APP',
    title: 'Шинэ мэдэгдэл',
    message: 'Мэдэгдлийн агуулга',
    data: { email: 'test@test.com', phoneNumber: '+97699999999' },
    read: false,
    sentAt: now,
    readAt: null,
    createdAt: now,
  });

  /** Тестэд ашиглах mock тохиргоо */
  const mockPreference = new NotificationPreferenceEntity({
    id: 'pref-1',
    userId: 'user-1',
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: true,
    channelPreferences: {},
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    notificationQueue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: NotificationPreferenceRepository,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
        {
          provide: NotificationCacheService,
          useValue: {
            invalidateUnreadCount: jest.fn(),
          },
        },
        {
          provide: getQueueToken('notifications'),
          useValue: notificationQueue,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get(NotificationRepository);
    preferenceRepository = module.get(NotificationPreferenceRepository);
    cacheService = module.get(NotificationCacheService);
    configService = module.get(ConfigService);
  });

  describe('send', () => {
    it('IN_APP мэдэгдэл DB-д бичээд кэш invalidate хийх', async () => {
      notificationRepository.create.mockResolvedValue(mockNotification);
      preferenceRepository.findByUserId.mockResolvedValue(null);
      configService.get.mockReturnValue(false);

      await service.send('user-1', {
        type: 'IN_APP',
        title: 'Шинэ мэдэгдэл',
        message: 'Мэдэгдлийн агуулга',
      });

      /** DB-д мэдэгдэл үүсгэгдсэн */
      expect(notificationRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'IN_APP',
        title: 'Шинэ мэдэгдэл',
        message: 'Мэдэгдлийн агуулга',
        data: null,
      });
      /** Unread кэш invalidate */
      expect(cacheService.invalidateUnreadCount).toHaveBeenCalledWith('user-1');
    });

    it('email идэвхтэй бол queue-д email job нэмэх', async () => {
      notificationRepository.create.mockResolvedValue(mockNotification);
      preferenceRepository.findByUserId.mockResolvedValue(mockPreference);
      /** Config-ийн get дуудагдах бүрт emailEnabled = true */
      configService.get.mockImplementation((key: string) => {
        if (key === 'notification.emailEnabled') return true;
        return false;
      });

      await service.send('user-1', {
        type: 'IN_APP',
        title: 'Шинэ мэдэгдэл',
        message: 'Мэдэгдлийн агуулга',
        data: { email: 'test@test.com' },
      });

      /** Email job queue-д нэмэгдсэн */
      expect(notificationQueue.add).toHaveBeenCalledWith('send-email', {
        to: 'test@test.com',
        subject: 'Шинэ мэдэгдэл',
        htmlContent: expect.stringContaining('Шинэ мэдэгдэл'),
        notificationId: 'notif-1',
      });
    });

    it('email preference идэвхгүй бол queue-д нэмэхгүй', async () => {
      /** Email preference false */
      const prefEmailOff = new NotificationPreferenceEntity({
        ...mockPreference,
        emailEnabled: false,
      });
      notificationRepository.create.mockResolvedValue(mockNotification);
      preferenceRepository.findByUserId.mockResolvedValue(prefEmailOff);
      configService.get.mockReturnValue(true);

      await service.send('user-1', {
        type: 'IN_APP',
        title: 'Test',
        message: 'Test',
        data: { email: 'test@test.com' },
      });

      /** Email job нэмэгдээгүй */
      expect(notificationQueue.add).not.toHaveBeenCalledWith('send-email', expect.anything());
    });

    it('SMS идэвхтэй бол queue-д sms job нэмэх', async () => {
      notificationRepository.create.mockResolvedValue(mockNotification);
      preferenceRepository.findByUserId.mockResolvedValue(mockPreference);
      configService.get.mockImplementation((key: string) => {
        if (key === 'notification.smsEnabled') return true;
        return false;
      });

      await service.send('user-1', {
        type: 'IN_APP',
        title: 'Test',
        message: 'Test message',
        data: { phoneNumber: '+97699999999' },
      });

      expect(notificationQueue.add).toHaveBeenCalledWith('send-sms', {
        to: '+97699999999',
        message: 'Test message',
        notificationId: 'notif-1',
      });
    });

    it('push идэвхтэй бол queue-д push job нэмэх', async () => {
      notificationRepository.create.mockResolvedValue(mockNotification);
      preferenceRepository.findByUserId.mockResolvedValue(mockPreference);
      configService.get.mockImplementation((key: string) => {
        if (key === 'notification.pushEnabled') return true;
        return false;
      });

      await service.send('user-1', {
        type: 'IN_APP',
        title: 'Push test',
        message: 'Push message',
        data: { extra: 'data' },
      });

      expect(notificationQueue.add).toHaveBeenCalledWith('send-push', {
        userId: 'user-1',
        title: 'Push test',
        body: 'Push message',
        data: { extra: 'data' },
        notificationId: 'notif-1',
      });
    });

    it('config идэвхгүй бол email/sms/push queue-д нэмэхгүй', async () => {
      notificationRepository.create.mockResolvedValue(mockNotification);
      preferenceRepository.findByUserId.mockResolvedValue(mockPreference);
      /** Бүх channel config-оор идэвхгүй */
      configService.get.mockReturnValue(false);

      await service.send('user-1', {
        type: 'IN_APP',
        title: 'Test',
        message: 'Test',
        data: {
          email: 'test@test.com',
          phoneNumber: '+97699999999',
        },
      });

      /** Queue-д юу ч нэмэгдээгүй */
      expect(notificationQueue.add).not.toHaveBeenCalled();
    });

    it('preference null бол default утга ашиглах', async () => {
      notificationRepository.create.mockResolvedValue(mockNotification);
      /** Preference байхгүй */
      preferenceRepository.findByUserId.mockResolvedValue(null);
      /** Email config идэвхтэй */
      configService.get.mockImplementation((key: string) => {
        if (key === 'notification.emailEnabled') return true;
        return false;
      });

      await service.send('user-1', {
        type: 'IN_APP',
        title: 'Default test',
        message: 'Default message',
        data: { email: 'test@test.com' },
      });

      /** Default emailEnabled = true тул email queue-д нэмэгдэнэ */
      expect(notificationQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({ to: 'test@test.com' }),
      );
    });
  });

  describe('sendBulk', () => {
    it('олон хэрэглэгчид мэдэгдэл илгээх', async () => {
      notificationRepository.create.mockResolvedValue(mockNotification);
      preferenceRepository.findByUserId.mockResolvedValue(null);
      configService.get.mockReturnValue(false);

      await service.sendBulk(['user-1', 'user-2', 'user-3'], {
        type: 'IN_APP',
        title: 'Bulk test',
        message: 'Bulk message',
      });

      /** 3 удаа create дуудагдсан */
      expect(notificationRepository.create).toHaveBeenCalledTimes(3);
      expect(cacheService.invalidateUnreadCount).toHaveBeenCalledTimes(3);
    });
  });
});
