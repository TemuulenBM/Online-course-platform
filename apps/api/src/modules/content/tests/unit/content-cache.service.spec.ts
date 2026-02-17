import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../../../../common/redis/redis.service';
import { ContentRepository } from '../../infrastructure/repositories/content.repository';
import { ContentCacheService } from '../../infrastructure/services/content-cache.service';
import { ContentEntity } from '../../domain/entities/content.entity';
import { TextContentVO } from '../../domain/value-objects/text-content.vo';

describe('ContentCacheService', () => {
  let service: ContentCacheService;
  let redisService: jest.Mocked<RedisService>;
  let contentRepository: jest.Mocked<ContentRepository>;

  /** Тестэд ашиглах mock контент */
  const mockContent = new ContentEntity({
    id: 'content-id-1',
    lessonId: 'lesson-id-1',
    contentType: 'text',
    textContent: new TextContentVO({
      html: '<p>Test</p>',
      markdown: '# Test',
      readingTimeMinutes: 5,
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Кэшэд хадгалагдсан контентын мэдээлэл (toResponse хэлбэр) */
  const cachedContentData = mockContent.toResponse();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: ContentRepository,
          useValue: {
            findByLessonId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ContentCacheService>(ContentCacheService);
    redisService = module.get(RedisService);
    contentRepository = module.get(ContentRepository);
  });

  describe('getContent', () => {
    it('кэшнээс контент авах (cache hit) — MongoDB руу хандаагүй', async () => {
      redisService.get.mockResolvedValue(cachedContentData);

      const result = await service.getContent('lesson-id-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('content-id-1');
      expect(result!.lessonId).toBe('lesson-id-1');
      expect(result!.contentType).toBe('text');
      expect(redisService.get).toHaveBeenCalledWith(
        'content:lesson:lesson-id-1',
      );
      /** MongoDB руу хандаагүй байх ёстой */
      expect(contentRepository.findByLessonId).not.toHaveBeenCalled();
    });

    it('кэш байхгүй, MongoDB-ээс аваад кэшлэх (cache miss)', async () => {
      redisService.get.mockResolvedValue(null);
      contentRepository.findByLessonId.mockResolvedValue(mockContent);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.getContent('lesson-id-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('content-id-1');
      expect(redisService.get).toHaveBeenCalledWith(
        'content:lesson:lesson-id-1',
      );
      expect(contentRepository.findByLessonId).toHaveBeenCalledWith(
        'lesson-id-1',
      );
      /** Кэшлэгдсэн байх ёстой (TTL: 900 секунд) */
      expect(redisService.set).toHaveBeenCalledWith(
        'content:lesson:lesson-id-1',
        mockContent.toResponse(),
        900,
      );
    });

    it('MongoDB-д ч олдоогүй (returns null)', async () => {
      redisService.get.mockResolvedValue(null);
      contentRepository.findByLessonId.mockResolvedValue(null);

      const result = await service.getContent('nonexistent');

      expect(result).toBeNull();
      /** Кэшлэгдээгүй байх ёстой */
      expect(redisService.set).not.toHaveBeenCalled();
    });
  });

  describe('invalidateContent', () => {
    it('зөв key устгах', async () => {
      redisService.del.mockResolvedValue(undefined);

      await service.invalidateContent('lesson-id-1');

      expect(redisService.del).toHaveBeenCalledWith(
        'content:lesson:lesson-id-1',
      );
    });
  });
});
