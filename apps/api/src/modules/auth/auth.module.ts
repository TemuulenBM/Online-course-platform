import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Controller
import { AuthController } from './interface/controllers/auth.controller';

// Use Cases
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';

// Repositories
import { UserRepository } from './infrastructure/repositories/user.repository';
import { SessionRepository } from './infrastructure/repositories/session.repository';
import { RefreshTokenRepository } from './infrastructure/repositories/refresh-token.repository';
import { PasswordResetRepository } from './infrastructure/repositories/password-reset.repository';

// Services
import { TokenService } from './infrastructure/services/token.service';
import { JwtStrategy } from './infrastructure/services/jwt.strategy';

// Users модулиас
import { UsersModule } from '../users/users.module';

/**
 * Auth модуль.
 * Бүртгэл, нэвтрэлт, токен шинэчлэл, нууц үг сэргээх,
 * гарах, одоогийн хэрэглэгч авах зэрэг бүх auth функцийг удирдана.
 */
@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiration') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Use Cases
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    GetCurrentUserUseCase,
    // Repositories
    UserRepository,
    SessionRepository,
    RefreshTokenRepository,
    PasswordResetRepository,
    // Services
    TokenService,
    JwtStrategy,
  ],
  exports: [UserRepository, TokenService],
})
export class AuthModule {}
