import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { LoginDto } from '../../dto/login.dto';
import * as hashUtil from '../../../../common/utils/hash.util';

jest.mock('../../../../common/utils/hash.util');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser = new UserEntity({
    id: 'user-id-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    role: 'STUDENT',
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn().mockReturnValue('access-token'),
            generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
            hashToken: jest.fn().mockReturnValue('hashed-token'),
            getRefreshTokenExpiry: jest.fn().mockReturnValue(new Date()),
          },
        },
        {
          provide: SessionRepository,
          useValue: { create: jest.fn() },
        },
        {
          provide: RefreshTokenRepository,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(UserRepository);
  });

  it('амжилттай нэвтрэх', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    (hashUtil.comparePassword as jest.Mock).mockResolvedValue(true);

    const dto: LoginDto = { email: 'test@example.com', password: 'password123' };
    const result = await useCase.execute(dto);

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user.email).toBe('test@example.com');
  });

  it('буруу имэйлтэй нэвтрэхэд алдаа буцаах', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const dto: LoginDto = { email: 'wrong@example.com', password: 'password123' };

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('буруу нууц үгтэй нэвтрэхэд алдаа буцаах', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    (hashUtil.comparePassword as jest.Mock).mockResolvedValue(false);

    const dto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('user enumeration-аас хамгаалсан — ижил алдааны мессеж', async () => {
    // Имэйл олдохгүй
    userRepository.findByEmail.mockResolvedValue(null);
    const dto1: LoginDto = { email: 'wrong@example.com', password: 'password123' };

    try {
      await useCase.execute(dto1);
    } catch (e: any) {
      expect(e.message).toBe('Имэйл эсвэл нууц үг буруу байна');
    }

    // Нууц үг буруу
    userRepository.findByEmail.mockResolvedValue(mockUser);
    (hashUtil.comparePassword as jest.Mock).mockResolvedValue(false);
    const dto2: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };

    try {
      await useCase.execute(dto2);
    } catch (e: any) {
      expect(e.message).toBe('Имэйл эсвэл нууц үг буруу байна');
    }
  });
});
