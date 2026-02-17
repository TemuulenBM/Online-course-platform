import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { RegisterDto } from '../../dto/register.dto';
import { LoginDto } from '../../dto/login.dto';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { ForgotPasswordDto } from '../../dto/forgot-password.dto';
import { ResetPasswordDto } from '../../dto/reset-password.dto';
import { AuthResponseDto, UserResponseDto } from '../../dto/auth-response.dto';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import {
  AUTH_THROTTLE,
  PASSWORD_RESET_THROTTLE,
} from '../../../../common/constants/throttle.constants';

/**
 * Баталгаажуулалтын controller.
 * Бүх auth endpoint-уудыг удирдана: бүртгэл, нэвтрэлт, токен шинэчлэл,
 * нууц үг сэргээх, гарах, одоогийн хэрэглэгч.
 */
@ApiTags('Баталгаажуулалт')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {}

  @Public()
  @Post('register')
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Шинэ хэрэглэгч бүртгүүлэх' })
  @ApiResponse({ status: 201, description: 'Амжилттай бүртгүүллээ', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Имэйл бүртгэлтэй байна' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.registerUseCase.execute(dto, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('login')
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Хэрэглэгч нэвтрэх' })
  @ApiResponse({ status: 200, description: 'Амжилттай нэвтэрлээ', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Имэйл эсвэл нууц үг буруу' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.loginUseCase.execute(dto, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Токен шинэчлэх' })
  @ApiResponse({ status: 200, description: 'Токен амжилттай шинэчлэгдлээ', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh токен хүчингүй' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Системээс гарах' })
  @ApiResponse({ status: 200, description: 'Амжилттай гарлаа' })
  @ApiResponse({ status: 401, description: 'Нэвтрээгүй байна' })
  async logout(@CurrentUser('id') userId: string) {
    await this.logoutUseCase.execute(userId);
    return { message: 'Амжилттай гарлаа' };
  }

  @Public()
  @Post('forgot-password')
  @Throttle(PASSWORD_RESET_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Нууц үг сэргээх хүсэлт' })
  @ApiResponse({ status: 200, description: 'Хүсэлт илгээгдлээ' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(dto.email);
  }

  @Public()
  @Post('reset-password')
  @Throttle(PASSWORD_RESET_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Нууц үг шинэчлэх' })
  @ApiResponse({ status: 200, description: 'Нууц үг амжилттай шинэчлэгдлээ' })
  @ApiResponse({ status: 400, description: 'Токен хүчингүй' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(dto.token, dto.password);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Одоогийн хэрэглэгчийн мэдээлэл' })
  @ApiResponse({ status: 200, description: 'Хэрэглэгчийн мэдээлэл', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Нэвтрээгүй байна' })
  async me(@CurrentUser('id') userId: string) {
    return this.getCurrentUserUseCase.execute(userId);
  }
}
