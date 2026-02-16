import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { UserProfileRepository } from '../../../users/infrastructure/repositories/user-profile.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { RegisterDto } from '../../dto/register.dto';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenService: jest.Mocked<TokenService>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let userProfileRepository: jest.Mocked<UserProfileRepository>;

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
        RegisterUseCase,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
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
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: RefreshTokenRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: UserProfileRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    userRepository = module.get(UserRepository);
    tokenService = module.get(TokenService);
    sessionRepository = module.get(SessionRepository);
    refreshTokenRepository = module.get(RefreshTokenRepository);
    userProfileRepository = module.get(UserProfileRepository);
  });

  it('амжилттай бүртгүүлэх', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(mockUser);

    const dto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Бат',
      lastName: 'Дорж',
    };

    const result = await useCase.execute(dto);

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user.email).toBe('test@example.com');
    expect(userRepository.create).toHaveBeenCalled();
    expect(refreshTokenRepository.create).toHaveBeenCalled();
    expect(sessionRepository.create).toHaveBeenCalled();
  });

  it('давхардсан имэйлтэй бүртгүүлэхэд алдаа буцаах', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);

    const dto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Бат',
      lastName: 'Дорж',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
  });

  it('имэйлийг жижиг үсгээр хадгалах', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(mockUser);

    const dto: RegisterDto = {
      email: 'Test@Example.COM',
      password: 'password123',
      firstName: 'Бат',
      lastName: 'Дорж',
    };

    await useCase.execute(dto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' }),
    );
  });
});
