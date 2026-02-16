import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UserCacheService } from '../../infrastructure/services/user-cache.service';

/**
 * Хэрэглэгч устгах use case.
 * Cascade delete — User устгахад Profile, Session, RefreshToken, PasswordReset бүгд устна.
 * Зөвхөн ADMIN эрхтэй хэрэглэгч ашиглана.
 */
@Injectable()
export class DeleteUserUseCase {
  private readonly logger = new Logger(DeleteUserUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userCacheService: UserCacheService,
  ) {}

  async execute(userId: string): Promise<void> {
    // Хэрэглэгч байгаа эсэх шалгах
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    // Cascade delete
    await this.prisma.user.delete({ where: { id: userId } });

    // Кэш invalidate
    await this.userCacheService.invalidate(userId);

    this.logger.log(`Хэрэглэгч устгагдлаа: ${user.email}`);
  }
}
