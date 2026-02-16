import { Test, TestingModule } from '@nestjs/testing';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { PasswordResetRepository } from '../../infrastructure/repositories/password-reset.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { UserEntity } from '../../domain/entities/user.entity';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordResetRepository: jest.Mocked<PasswordResetRepository>;

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
        ForgotPasswordUseCase,
        {
          provide: UserRepository,
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: PasswordResetRepository,
          useValue: { create: jest.fn() },
        },
        {
          provide: TokenService,
          useValue: { hashToken: jest.fn().mockReturnValue('hashed-reset-token') },
        },
      ],
    }).compile();

    useCase = module.get<ForgotPasswordUseCase>(ForgotPasswordUseCase);
    userRepository = module.get(UserRepository);
    passwordResetRepository = module.get(PasswordResetRepository);
  });

  it('бүртгэлтэй имэйлд токен үүсгэх', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);

    const result = await useCase.execute('test@example.com');

    expect(passwordResetRepository.create).toHaveBeenCalled();
    expect(result.message).toContain('имэйл бүртгэлтэй бол');
  });

  it('бүртгэлгүй имэйлд ч амжилттай хариу буцаах (user enumeration хамгаалалт)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute('unknown@example.com');

    expect(passwordResetRepository.create).not.toHaveBeenCalled();
    expect(result.message).toContain('имэйл бүртгэлтэй бол');
  });
});
