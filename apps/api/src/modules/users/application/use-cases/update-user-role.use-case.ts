import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Role } from '@prisma/client';

/**
 * Хэрэглэгчийн эрх солих use case.
 * Зөвхөн ADMIN эрхтэй хэрэглэгч ашиглана.
 */
@Injectable()
export class UpdateUserRoleUseCase {
  private readonly logger = new Logger(UpdateUserRoleUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, role: Role): Promise<{ id: string; email: string; role: Role }> {
    // Хэрэглэгч байгаа эсэх шалгах
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    this.logger.log(`Хэрэглэгчийн эрх өөрчлөгдлөө: ${userId} → ${role}`);

    return {
      id: updated.id,
      email: updated.email,
      role: updated.role,
    };
  }
}
