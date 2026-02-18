import { Test, TestingModule } from '@nestjs/testing';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';
import { RedisService } from '../../../../common/redis/redis.service';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationPreferenceRepository } from '../../infrastructure/repositories/notification-preference.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationPreferenceEntity } from '../../domain/entities/notification-preference.entity';

describe('NotificationCacheService', () => {
  let service: NotificationCacheService;
  let redisService: jest.Mocked<RedisService>;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let preferenceRepository: jest.Mocked<NotificationPreferenceRepository>;

  const now = new Date();

  /** Тестэд ашиглах mock мэдэгдэл */
  const mockNotification = new NotificationEntity({
    id: 'notif-1',
    userId: 'user-1',
    type: 'IN_APP',
    title: 'Test мэдэгдэл',
    message: 'Тест агуулга',
    data: { courseId: 'course-1' },
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
    smsEnabled: false,
    channelPreferences: {},
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: NotificationRepository,
          useValue: {
            findById: jest.fn(),
            countUnread: jest.fn(),
          },
        },
        {
          provide: NotificationPreferenceRepository,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationCacheService>(NotificationCacheService);
    redisService = module.get(RedisService);
    notificationRepository = module.get(NotificationRepository);
    preferenceRepository = module.get(NotificationPreferenceRepository);
  });

  describe('getNotification', () => {
    it('кэшээс мэдэгдэл олдвол шууд буцаах', async () => {
      /** Кэшэд байгаа мэдэгдлийн response хэлбэр */
      const cachedData = {
        ...mockNotification.toResponse(),
        sentAt: now.toISOString(),
        readAt: null,
        createdAt: now.toISOString(),
      };
      redisService.get.mockResolvedValue(cachedData);

      const result = await service.getNotification('notif-1');

      expect(result).toBeInstanceOf(NotificationEntity);
      expect(result!.id).toBe('notif-1');
      expect(redisService.get).toHaveBeenCalledWith('notification:notif-1');
      /** DB дуудагдаагүй байх */
      expect(notificationRepository.findById).not.toHaveBeenCalled();
    });

    it('кэшэд байхгүй бол DB-ээс аваад кэшлэх', async () => {
      redisService.get.mockResolvedValue(null);
      notificationRepository.findById.mockResolvedValue(mockNotification);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.getNotification('notif-1');

      expect(result).toEqual(mockNotification);
      expect(notificationRepository.findById).toHaveBeenCalledWith('notif-1');
      expect(redisService.set).toHaveBeenCalledWith(
        'notification:notif-1',
        mockNotification.toResponse(),
        900,
      );
    });

    it('DB-д олдоогүй бол null буцаах, кэшлэхгүй', async () => {
      redisService.get.mockResolvedValue(null);
      notificationRepository.findById.mockResolvedValue(null);

      const result = await service.getNotification('notif-999');

      expect(result).toBeNull();
      expect(redisService.set).not.toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('кэшээс уншаагүй тоо олдвол шууд буцаах', async () => {
      redisService.get.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(result).toBe(5);
      expect(redisService.get).toHaveBeenCalledWith('notification:unread:user-1');
      expect(notificationRepository.countUnread).not.toHaveBeenCalled();
    });

    it('кэшэд байхгүй бол DB-ээс тоолоод кэшлэх', async () => {
      redisService.get.mockResolvedValue(null);
      notificationRepository.countUnread.mockResolvedValue(3);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.getUnreadCount('user-1');

      expect(result).toBe(3);
      expect(notificationRepository.countUnread).toHaveBeenCalledWith('user-1');
      expect(redisService.set).toHaveBeenCalledWith('notification:unread:user-1', 3, 900);
    });
  });

  describe('getPreferences', () => {
    it('кэшээс тохиргоо олдвол шууд буцаах', async () => {
      const cachedData = {
        ...mockPreference.toResponse(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      redisService.get.mockResolvedValue(cachedData);

      const result = await service.getPreferences('user-1');

      expect(result).toBeInstanceOf(NotificationPreferenceEntity);
      expect(result!.userId).toBe('user-1');
      expect(redisService.get).toHaveBeenCalledWith('notification:prefs:user-1');
      expect(preferenceRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('кэшэд байхгүй бол DB-ээс аваад кэшлэх', async () => {
      redisService.get.mockResolvedValue(null);
      preferenceRepository.findByUserId.mockResolvedValue(mockPreference);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.getPreferences('user-1');

      expect(result).toEqual(mockPreference);
      expect(preferenceRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(redisService.set).toHaveBeenCalledWith(
        'notification:prefs:user-1',
        mockPreference.toResponse(),
        900,
      );
    });

    it('DB-д олдоогүй бол null буцаах, кэшлэхгүй', async () => {
      redisService.get.mockResolvedValue(null);
      preferenceRepository.findByUserId.mockResolvedValue(null);

      const result = await service.getPreferences('user-1');

      expect(result).toBeNull();
      expect(redisService.set).not.toHaveBeenCalled();
    });
  });

  describe('invalidateNotification', () => {
    it('мэдэгдлийн кэш устгах', async () => {
      redisService.del.mockResolvedValue(undefined);

      await service.invalidateNotification('notif-1');

      expect(redisService.del).toHaveBeenCalledWith('notification:notif-1');
    });
  });

  describe('invalidateUnreadCount', () => {
    it('уншаагүй тооны кэш устгах', async () => {
      redisService.del.mockResolvedValue(undefined);

      await service.invalidateUnreadCount('user-1');

      expect(redisService.del).toHaveBeenCalledWith('notification:unread:user-1');
    });
  });

  describe('invalidatePreferences', () => {
    it('тохиргооны кэш устгах', async () => {
      redisService.del.mockResolvedValue(undefined);

      await service.invalidatePreferences('user-1');

      expect(redisService.del).toHaveBeenCalledWith('notification:prefs:user-1');
    });
  });
});
