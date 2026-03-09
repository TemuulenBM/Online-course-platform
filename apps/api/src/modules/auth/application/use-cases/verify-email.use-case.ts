import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { EmailVerificationRepository } from '../../infrastructure/repositories/email-verification.repository';
import { TokenService } from '../../infrastructure/services/token.service';

/**
 * Имэйл баталгаажуулах use case.
 * Токеныг шалгаж, хэрэглэгчийн emailVerified-г true болгоно.
 */
@Injectable()
export class VerifyEmailUseCase {
  private readonly logger = new Logger(VerifyEmailUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(rawToken: string): Promise<{ message: string }> {
    // Токеныг хэшлэж DB-ээс хайна
    const hashedToken = this.tokenService.hashToken(rawToken);
    const record = await this.emailVerificationRepository.findValidByToken(hashedToken);

    if (!record) {
      throw new BadRequestException('Баталгаажуулах токен хүчингүй эсвэл хугацаа дууссан байна');
    }

    // Ашигласан гэж тэмдэглэх + emailVerified тохируулах — дарааллаар хийнэ
    await this.emailVerificationRepository.markAsUsed(record.id);
    await this.userRepository.updateEmailVerified(record.userId);

    this.logger.log(`Имэйл баталгаажлаа: userId=${record.userId}`);

    return { message: 'Имэйл хаяг амжилттай баталгаажлаа. Одоо нэвтэрч болно.' };
  }
}
