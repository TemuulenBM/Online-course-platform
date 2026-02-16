import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenService: jest.Mocked<TokenService>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

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

  const mockRefreshToken = new RefreshTokenEntity({
    id: 'token-id-1',
    userId: 'user-id-1',
    token: 'hashed-refresh-token',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revoked: false,
    createdAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: UserRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: TokenService,
          useValue: {
            hashToken: jest.fn().mockReturnValue('hashed-refresh-token'),
            generateAccessToken: jest.fn().mockReturnValue('new-access-token'),
            generateRefreshToken: jest.fn().mockReturnValue('new-refresh-token'),
            getRefreshTokenExpiry: jest.fn().mockReturnValue(new Date()),
          },
        },
        {
          provide: RefreshTokenRepository,
          useValue: {
            findByToken: jest.fn(),
            revoke: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    userRepository = module.get(UserRepository);
    tokenService = module.get(TokenService);
    refreshTokenRepository = module.get(RefreshTokenRepository);
  });

  it('амжилттай токен шинэчлэх (token rotation)', async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(mockRefreshToken);
    userRepository.findById.mockResolvedValue(mockUser);

    const result = await useCase.execute('raw-refresh-token');

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('token-id-1');
    expect(refreshTokenRepository.create).toHaveBeenCalled();
  });

  it('хүчингүй refresh token-д алдаа буцаах', async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(null);

    await expect(useCase.execute('invalid-token')).rejects.toThrow(UnauthorizedException);
  });

  it('хэрэглэгч олдохгүй бол алдаа буцаах', async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(mockRefreshToken);
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('raw-refresh-token')).rejects.toThrow(UnauthorizedException);
  });
});
