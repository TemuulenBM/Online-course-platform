import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UserCacheService } from '../../infrastructure/services/user-cache.service';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let prisma: jest.Mocked<PrismaService>;
  let userCacheService: jest.Mocked<UserCacheService>;

  /** Тестэд ашиглах mock хэрэглэгч */
  const mockUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    role: 'STUDENT' as const,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: UserCacheService,
          useValue: {
            invalidate: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    prisma = module.get(PrismaService);
    userCacheService = module.get(UserCacheService);
  });

  it('амжилттай хэрэглэгч устгах', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);
    userCacheService.invalidate.mockResolvedValue(undefined);

    await useCase.execute('user-id-1');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-id-1' } });
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-id-1' } });
    expect(userCacheService.invalidate).toHaveBeenCalledWith('user-id-1');
  });

  it('хэрэглэгч олдоогүй үед алдаа буцаах', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute('user-id-1')).rejects.toThrow(NotFoundException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
    expect(userCacheService.invalidate).not.toHaveBeenCalled();
  });
});
