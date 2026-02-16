import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

/**
 * Одоогийн хэрэглэгчийн мэдээлэл авах use case.
 * JWT-аас олгосон ID-аар хэрэглэгчийн мэдээлэл (нууц үггүй) буцаана.
 */
@Injectable()
export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    return user.toResponse();
  }
}
