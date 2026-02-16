import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../interface/controllers/auth.controller';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUseCase: jest.Mocked<RegisterUseCase>;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;
  let forgotPasswordUseCase: jest.Mocked<ForgotPasswordUseCase>;
  let resetPasswordUseCase: jest.Mocked<ResetPasswordUseCase>;
  let getCurrentUserUseCase: jest.Mocked<GetCurrentUserUseCase>;

  const mockAuthResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: {
      id: 'user-id-1',
      email: 'test@example.com',
      role: 'STUDENT',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
    },
  };

  const mockRequest = {
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUseCase, useValue: { execute: jest.fn() } },
        { provide: LoginUseCase, useValue: { execute: jest.fn() } },
        { provide: RefreshTokenUseCase, useValue: { execute: jest.fn() } },
        { provide: LogoutUseCase, useValue: { execute: jest.fn() } },
        { provide: ForgotPasswordUseCase, useValue: { execute: jest.fn() } },
        { provide: ResetPasswordUseCase, useValue: { execute: jest.fn() } },
        { provide: GetCurrentUserUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    registerUseCase = module.get(RegisterUseCase);
    loginUseCase = module.get(LoginUseCase);
    refreshTokenUseCase = module.get(RefreshTokenUseCase);
    logoutUseCase = module.get(LogoutUseCase);
    forgotPasswordUseCase = module.get(ForgotPasswordUseCase);
    resetPasswordUseCase = module.get(ResetPasswordUseCase);
    getCurrentUserUseCase = module.get(GetCurrentUserUseCase);
  });

  describe('register', () => {
    it('бүртгүүлэх endpoint зөв ажиллах', async () => {
      registerUseCase.execute.mockResolvedValue(mockAuthResponse);

      const dto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Бат',
        lastName: 'Дорж',
      };

      const result = await controller.register(dto, mockRequest);

      expect(result).toEqual(mockAuthResponse);
      expect(registerUseCase.execute).toHaveBeenCalledWith(dto, '127.0.0.1', 'test-agent');
    });
  });

  describe('login', () => {
    it('нэвтрэх endpoint зөв ажиллах', async () => {
      loginUseCase.execute.mockResolvedValue(mockAuthResponse);

      const dto = { email: 'test@example.com', password: 'password123' };
      const result = await controller.login(dto, mockRequest);

      expect(result).toEqual(mockAuthResponse);
      expect(loginUseCase.execute).toHaveBeenCalledWith(dto, '127.0.0.1', 'test-agent');
    });
  });

  describe('refresh', () => {
    it('токен шинэчлэх endpoint зөв ажиллах', async () => {
      refreshTokenUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await controller.refresh({ refreshToken: 'some-token' });

      expect(result).toEqual(mockAuthResponse);
      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith('some-token');
    });
  });

  describe('logout', () => {
    it('гарах endpoint зөв ажиллах', async () => {
      logoutUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.logout('user-id-1');

      expect(result).toEqual({ message: 'Амжилттай гарлаа' });
      expect(logoutUseCase.execute).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('forgotPassword', () => {
    it('нууц үг сэргээх endpoint зөв ажиллах', async () => {
      const expectedResult = { message: 'Хүсэлт илгээгдлээ' };
      forgotPasswordUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.forgotPassword({ email: 'test@example.com' });

      expect(result).toEqual(expectedResult);
      expect(forgotPasswordUseCase.execute).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('resetPassword', () => {
    it('нууц үг шинэчлэх endpoint зөв ажиллах', async () => {
      const expectedResult = { message: 'Нууц үг амжилттай шинэчлэгдлээ' };
      resetPasswordUseCase.execute.mockResolvedValue(expectedResult);

      const dto = { token: 'raw-token', password: 'newpassword123' };
      const result = await controller.resetPassword(dto);

      expect(result).toEqual(expectedResult);
      expect(resetPasswordUseCase.execute).toHaveBeenCalledWith('raw-token', 'newpassword123');
    });
  });

  describe('me', () => {
    it('одоогийн хэрэглэгчийн мэдээлэл буцаах', async () => {
      const userResponse = mockAuthResponse.user;
      getCurrentUserUseCase.execute.mockResolvedValue(userResponse);

      const result = await controller.me('user-id-1');

      expect(result).toEqual(userResponse);
      expect(getCurrentUserUseCase.execute).toHaveBeenCalledWith('user-id-1');
    });
  });
});
