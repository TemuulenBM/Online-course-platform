import { Test, TestingModule } from '@nestjs/testing';
import { CertificateCacheService } from '../../infrastructure/services/certificate-cache.service';
import { CertificateRepository } from '../../infrastructure/repositories/certificate.repository';
import { RedisService } from '../../../../common/redis/redis.service';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

describe('CertificateCacheService', () => {
  let cacheService: CertificateCacheService;
  let redisService: jest.Mocked<RedisService>;
  let certificateRepository: jest.Mocked<CertificateRepository>;

  /** Тестэд ашиглах mock сертификат entity */
  const mockCertificate = new CertificateEntity({
    id: 'cert-1',
    userId: 'user-1',
    courseId: 'course-1',
    certificateNumber: 'OCP-2026-ABCD1234',
    pdfUrl: null,
    qrCodeUrl: null,
    verificationCode: '550e8400e29b41d4a716446655440000',
    issuedAt: new Date('2026-01-01'),
    createdAt: new Date('2026-01-01'),
    userName: 'John Doe',
    userEmail: 'john@example.com',
    courseTitle: 'Test Course',
    courseSlug: 'test-course',
    courseInstructorId: 'instructor-1',
  });

  /** Redis-д хадгалагдсан кэш өгөгдөл (toResponse() формат, Date-ууд string болсон) */
  const cachedData = {
    ...mockCertificate.toResponse(),
    issuedAt: new Date('2026-01-01').toISOString(),
    createdAt: new Date('2026-01-01').toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: CertificateRepository,
          useValue: {
            findById: jest.fn(),
            findByVerificationCode: jest.fn(),
          },
        },
      ],
    }).compile();

    cacheService = module.get<CertificateCacheService>(CertificateCacheService);
    redisService = module.get(RedisService);
    certificateRepository = module.get(CertificateRepository);
  });

  describe('getCertificate', () => {
    it('Кэшэд байвал DB рүү хандахгүй (cache hit)', async () => {
      redisService.get.mockResolvedValue(cachedData);

      const result = await cacheService.getCertificate('cert-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('cert-1');
      expect(result!.certificateNumber).toBe('OCP-2026-ABCD1234');
      expect(result!.issuedAt).toBeInstanceOf(Date);
      expect(result!.createdAt).toBeInstanceOf(Date);
      expect(redisService.get).toHaveBeenCalledWith('certificate:cert-1');
      expect(certificateRepository.findById).not.toHaveBeenCalled();
    });

    it('Кэшэд байхгүй бол DB-ээс аваад кэшлэх (cache miss)', async () => {
      redisService.get.mockResolvedValue(null);
      certificateRepository.findById.mockResolvedValue(mockCertificate);

      const result = await cacheService.getCertificate('cert-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('cert-1');
      expect(certificateRepository.findById).toHaveBeenCalledWith('cert-1');
      expect(redisService.set).toHaveBeenCalledWith(
        'certificate:cert-1',
        mockCertificate.toResponse(),
        900,
      );
    });

    it('Кэшэд ч DB-д ч байхгүй бол null буцаах', async () => {
      redisService.get.mockResolvedValue(null);
      certificateRepository.findById.mockResolvedValue(null);

      const result = await cacheService.getCertificate('nonexistent');

      expect(result).toBeNull();
      expect(certificateRepository.findById).toHaveBeenCalledWith('nonexistent');
      expect(redisService.set).not.toHaveBeenCalled();
    });
  });

  describe('getByVerificationCode', () => {
    it('Кэшэд байвал DB рүү хандахгүй (cache hit)', async () => {
      redisService.get.mockResolvedValue(cachedData);

      const result = await cacheService.getByVerificationCode('550e8400e29b41d4a716446655440000');

      expect(result).toBeDefined();
      expect(result!.id).toBe('cert-1');
      expect(result!.verificationCode).toBe('550e8400e29b41d4a716446655440000');
      expect(redisService.get).toHaveBeenCalledWith(
        'certificate:verify:550e8400e29b41d4a716446655440000',
      );
      expect(certificateRepository.findByVerificationCode).not.toHaveBeenCalled();
    });

    it('Кэшэд байхгүй бол DB-ээс аваад кэшлэх (cache miss)', async () => {
      redisService.get.mockResolvedValue(null);
      certificateRepository.findByVerificationCode.mockResolvedValue(mockCertificate);

      const result = await cacheService.getByVerificationCode('550e8400e29b41d4a716446655440000');

      expect(result).toBeDefined();
      expect(result!.id).toBe('cert-1');
      expect(certificateRepository.findByVerificationCode).toHaveBeenCalledWith(
        '550e8400e29b41d4a716446655440000',
      );
      expect(redisService.set).toHaveBeenCalledWith(
        'certificate:verify:550e8400e29b41d4a716446655440000',
        mockCertificate.toResponse(),
        900,
      );
    });
  });

  describe('invalidateAll', () => {
    it('Бүх холбоотой кэш устгах — 2 del дуудалт хийгдэх', async () => {
      redisService.del.mockResolvedValue(undefined);

      await cacheService.invalidateAll('cert-1', '550e8400e29b41d4a716446655440000');

      expect(redisService.del).toHaveBeenCalledTimes(2);
      expect(redisService.del).toHaveBeenCalledWith('certificate:cert-1');
      expect(redisService.del).toHaveBeenCalledWith(
        'certificate:verify:550e8400e29b41d4a716446655440000',
      );
    });
  });
});
