import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        {
          provide: SessionRepository,
          useValue: { deleteAllByUserId: jest.fn() },
        },
        {
          provide: RefreshTokenRepository,
          useValue: { revokeAllByUserId: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
    sessionRepository = module.get(SessionRepository);
    refreshTokenRepository = module.get(RefreshTokenRepository);
  });

  it('гарахад бүх сесси болон refresh token цуцлагдах', async () => {
    await useCase.execute('user-id-1');

    expect(sessionRepository.deleteAllByUserId).toHaveBeenCalledWith('user-id-1');
    expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith('user-id-1');
  });
});
