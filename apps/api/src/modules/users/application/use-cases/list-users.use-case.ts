import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from '../../infrastructure/repositories/user-profile.repository';
import { ListUsersQueryDto } from '../../dto/list-users-query.dto';

/**
 * Хэрэглэгчдийн жагсаалт авах use case.
 * Pagination болон role filter дэмжинэ. Зөвхөн ADMIN.
 */
@Injectable()
export class ListUsersUseCase {
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async execute(query: ListUsersQueryDto) {
    const result = await this.userProfileRepository.findManyWithUser({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      role: query.role,
    });

    return {
      data: result.data.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        profile: user.profile?.toResponse() ?? null,
      })),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }
}
