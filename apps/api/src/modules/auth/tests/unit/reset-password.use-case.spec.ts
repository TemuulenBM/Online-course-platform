import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { PasswordResetRepository } from '../../infrastructure/repositories/password-reset.repository';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { PasswordResetEntity } from '../../domain/entities/password-reset.entity';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordResetRepository: jest.Mocked<PasswordResetRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

  const mockResetRecord = new PasswordResetEntity({
    id: 'reset-id-1',
    userId: 'user-id-1',
    token: 'hashed-token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    used: false,
    createdAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase,
        {
          provide: UserRepository,
          useValue: { updatePassword: jest.fn() },
        },
        {
          provide: PasswordResetRepository,
          useValue: {
            findValidByToken: jest.fn(),
            markAsUsed: jest.fn(),
          },
        },
        {
          provide: SessionRepository,
          useValue: { deleteAllByUserId: jest.fn() },
        },
        {
          provide: RefreshTokenRepository,
          useValue: { revokeAllByUserId: jest.fn() },
        },
        {
          provide: TokenService,
          useValue: { hashToken: jest.fn().mockReturnValue('hashed-token') },
        },
      ],
    }).compile();

    useCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
    userRepository = module.get(UserRepository);
    passwordResetRepository = module.get(PasswordResetRepository);
    sessionRepository = module.get(SessionRepository);
    refreshTokenRepository = module.get(RefreshTokenRepository);
  });

  it('амжилттай нууц үг шинэчлэх', async () => {
    passwordResetRepository.findValidByToken.mockResolvedValue(mockResetRecord);

    const result = await useCase.execute('raw-token', 'newpassword123');

    expect(userRepository.updatePassword).toHaveBeenCalled();
    expect(passwordResetRepository.markAsUsed).toHaveBeenCalledWith('reset-id-1');
    expect(sessionRepository.deleteAllByUserId).toHaveBeenCalledWith('user-id-1');
    expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith('user-id-1');
    expect(result.message).toContain('амжилттай');
  });

  it('хүчингүй токенд алдаа буцаах', async () => {
    passwordResetRepository.findValidByToken.mockResolvedValue(null);

    await expect(useCase.execute('invalid-token', 'newpassword123')).rejects.toThrow(
      BadRequestException,
    );
  });
});
