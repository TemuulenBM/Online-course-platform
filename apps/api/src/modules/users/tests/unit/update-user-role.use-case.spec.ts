import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserRoleUseCase } from '../../application/use-cases/update-user-role.use-case';
import { PrismaService } from '../../../../common/prisma/prisma.service';

describe('UpdateUserRoleUseCase', () => {
  let useCase: UpdateUserRoleUseCase;
  let prisma: jest.Mocked<PrismaService>;

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

  /** Эрх шинэчлэгдсэн mock хэрэглэгч */
  const updatedUser = {
    ...mockUser,
    role: 'TEACHER' as const,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserRoleUseCase,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserRoleUseCase>(UpdateUserRoleUseCase);
    prisma = module.get(PrismaService);
  });

  it('амжилттай эрх солих', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

    const result = await useCase.execute('user-id-1', 'TEACHER' as any);

    expect(result).toEqual({
      id: 'user-id-1',
      email: 'test@example.com',
      role: 'TEACHER',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-id-1' } });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id-1' },
      data: { role: 'TEACHER' },
    });
  });

  it('хэрэглэгч олдоогүй үед алдаа буцаах', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute('user-id-1', 'TEACHER' as any)).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
