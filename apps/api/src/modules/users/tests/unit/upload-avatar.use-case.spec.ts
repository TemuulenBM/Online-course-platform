import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';

/** Sharp mock — тест дотор бодит зураг шаардлагагүй */
const mockResizedBuffer = Buffer.from('resized-image-data');
jest.mock('sharp', () => {
  const sharpInstance = {
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(mockResizedBuffer),
  };
  return jest.fn(() => sharpInstance);
});

import { UploadAvatarUseCase } from '../../application/use-cases/upload-avatar.use-case';
import { UserProfileRepository } from '../../infrastructure/repositories/user-profile.repository';
import { UserCacheService } from '../../infrastructure/services/user-cache.service';
import { STORAGE_SERVICE } from '../../../content/infrastructure/services/storage/storage.interface';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';

describe('UploadAvatarUseCase', () => {
  let useCase: UploadAvatarUseCase;
  let userProfileRepository: jest.Mocked<UserProfileRepository>;
  let userCacheService: jest.Mocked<UserCacheService>;
  let storageService: { upload: jest.Mock; delete: jest.Mock };

  /** Mock профайл */
  const mockProfile = new UserProfileEntity({
    id: 'profile-id-1',
    userId: 'user-id-1',
    firstName: 'Бат',
    lastName: 'Дорж',
    avatarUrl: null,
    bio: null,
    country: null,
    timezone: null,
    preferences: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Аватартай mock профайл */
  const profileWithAvatar = new UserProfileEntity({
    ...mockProfile,
    avatarUrl: '/uploads/avatars/user-id-1.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Зөв mock файл */
  const mockFile = {
    originalname: 'photo.png',
    mimetype: 'image/png',
    size: 1024 * 100,
    buffer: Buffer.from('test'),
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadAvatarUseCase,
        {
          provide: UserProfileRepository,
          useValue: {
            findByUserId: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: UserCacheService,
          useValue: {
            invalidate: jest.fn(),
          },
        },
        {
          provide: STORAGE_SERVICE,
          useValue: {
            upload: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UploadAvatarUseCase>(UploadAvatarUseCase);
    userProfileRepository = module.get(UserProfileRepository);
    userCacheService = module.get(UserCacheService);
    storageService = module.get(STORAGE_SERVICE);
  });

  it('аватар амжилттай upload хийх', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(mockProfile);
    storageService.upload.mockResolvedValue({
      url: '/uploads/avatars/user-id-1.jpg',
      sizeBytes: 102400,
    });
    userProfileRepository.update.mockResolvedValue(profileWithAvatar);
    userCacheService.invalidate.mockResolvedValue(undefined);

    const result = await useCase.execute('user-id-1', { ...mockFile });

    expect(result.avatarUrl).toBe('/uploads/avatars/user-id-1.jpg');
    expect(storageService.upload).toHaveBeenCalledWith(
      expect.objectContaining({ mimetype: 'image/jpeg' }),
      'avatars/user-id-1.jpg',
    );
    expect(userProfileRepository.update).toHaveBeenCalledWith('user-id-1', {
      avatarUrl: '/uploads/avatars/user-id-1.jpg',
    });
    expect(userCacheService.invalidate).toHaveBeenCalledWith('user-id-1');
  });

  it('хуучин аватар байвал устгаж шинийг upload хийх', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(profileWithAvatar);
    storageService.delete.mockResolvedValue(undefined);
    storageService.upload.mockResolvedValue({
      url: '/uploads/avatars/user-id-1.jpg',
      sizeBytes: 102400,
    });
    userProfileRepository.update.mockResolvedValue(profileWithAvatar);
    userCacheService.invalidate.mockResolvedValue(undefined);

    await useCase.execute('user-id-1', { ...mockFile });

    expect(storageService.delete).toHaveBeenCalledWith('/uploads/avatars/user-id-1.jpg');
    expect(storageService.upload).toHaveBeenCalled();
  });

  it('файл байхгүй үед алдаа буцаах', async () => {
    await expect(useCase.execute('user-id-1', undefined as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('буруу MIME type үед алдаа буцаах', async () => {
    const badFile = { ...mockFile, mimetype: 'application/pdf' } as Express.Multer.File;

    await expect(useCase.execute('user-id-1', badFile)).rejects.toThrow(BadRequestException);
  });

  it('хэт том файл үед алдаа буцаах', async () => {
    const bigFile = { ...mockFile, size: 10 * 1024 * 1024 } as Express.Multer.File;

    await expect(useCase.execute('user-id-1', bigFile)).rejects.toThrow(BadRequestException);
  });

  it('профайл олдоогүй үед алдаа буцаах', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute('user-id-1', mockFile)).rejects.toThrow(NotFoundException);
  });
});
