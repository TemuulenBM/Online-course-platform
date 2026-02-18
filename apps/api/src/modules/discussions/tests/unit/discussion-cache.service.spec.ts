import { Test, TestingModule } from '@nestjs/testing';
import { DiscussionCacheService } from '../../infrastructure/services/discussion-cache.service';
import { DiscussionPostRepository } from '../../infrastructure/repositories/discussion-post.repository';
import { RedisService } from '../../../../common/redis/redis.service';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';

describe('DiscussionCacheService', () => {
  let cacheService: DiscussionCacheService;
  let redisService: jest.Mocked<RedisService>;
  let postRepository: jest.Mocked<DiscussionPostRepository>;

  const now = new Date();

  /** Тест өгөгдөл: нийтлэл entity */
  const mockPost = new DiscussionPostEntity({
    id: 'post-id-1',
    courseId: 'course-id-1',
    lessonId: 'lesson-id-1',
    authorId: 'user-id-1',
    postType: 'question',
    title: 'Тестийн асуулт',
    content: 'Энэ бол тест асуулт юм',
    contentHtml: '<p>Энэ бол тест асуулт юм</p>',
    isAnswered: false,
    upvotes: 0,
    downvotes: 0,
    voteScore: 0,
    replies: [],
    voters: [],
    tags: ['test'],
    viewsCount: 5,
    isPinned: false,
    isLocked: false,
    isFlagged: false,
    createdAt: now,
    updatedAt: now,
  });

  /** Кэш дэх JSON өгөгдөл — toResponse()-ийн буцаах хэлбэр */
  const cachedPostResponse = mockPost.toResponse();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscussionCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: DiscussionPostRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    cacheService = module.get<DiscussionCacheService>(DiscussionCacheService);
    redisService = module.get(RedisService);
    postRepository = module.get(DiscussionPostRepository);
  });

  it('кэшнээс нийтлэл олох (cache hit)', async () => {
    /** Redis кэшэд байгаа нийтлэлийг DB рүү хандахгүй авах */
    redisService.get.mockResolvedValue(cachedPostResponse);

    const result = await cacheService.getPostById('post-id-1');

    expect(result).toBeDefined();
    expect(result!.id).toBe('post-id-1');
    expect(result!.courseId).toBe('course-id-1');
    expect(result!.title).toBe('Тестийн асуулт');
    /** DB repository дуудагдаагүй байх */
    expect(postRepository.findById).not.toHaveBeenCalled();
  });

  it('кэш байхгүй бол DB-ээс авах (cache miss)', async () => {
    /** Redis-д байхгүй бол DB-ээс аваад кэшлэх */
    redisService.get.mockResolvedValue(null);
    postRepository.findById.mockResolvedValue(mockPost);

    const result = await cacheService.getPostById('post-id-1');

    expect(result).toBeDefined();
    expect(result!.id).toBe('post-id-1');
    /** DB-ээс авсан эсэхийг шалгах */
    expect(postRepository.findById).toHaveBeenCalledWith('post-id-1');
    /** Redis-д кэшлэгдсэн эсэхийг шалгах (TTL 900 секунд) */
    expect(redisService.set).toHaveBeenCalledWith(
      'discussion:post:post-id-1',
      mockPost.toResponse(),
      900,
    );
  });

  it('нийтлэл олдоогүй бол null буцаах', async () => {
    /** Кэш болон DB-д аль алинд нь олдохгүй бол null */
    redisService.get.mockResolvedValue(null);
    postRepository.findById.mockResolvedValue(null);

    const result = await cacheService.getPostById('nonexistent');

    expect(result).toBeNull();
    /** DB-ээс хайсан боловч олдоогүй */
    expect(postRepository.findById).toHaveBeenCalledWith('nonexistent');
    /** Олдоогүй тохиолдолд кэшлэхгүй */
    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('invalidatePost дуудагдах', async () => {
    /** Нийтлэлийн кэш устгагдах эсэхийг шалгах */
    await cacheService.invalidatePost('post-id-1');

    expect(redisService.del).toHaveBeenCalledWith('discussion:post:post-id-1');
  });
});
