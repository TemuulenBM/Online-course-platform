import { Module } from '@nestjs/common';

// Controller
import { UsersController } from './interface/controllers/users.controller';

// Use Cases
import { CreateUserProfileUseCase } from './application/use-cases/create-user-profile.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';
import { UpdateUserRoleUseCase } from './application/use-cases/update-user-role.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

// Infrastructure
import { UserProfileRepository } from './infrastructure/repositories/user-profile.repository';
import { UserCacheService } from './infrastructure/services/user-cache.service';

/**
 * Users модуль.
 * Хэрэглэгчийн профайл CRUD, role удирдлага, хэрэглэгчдийн жагсаалт,
 * кэшлэлт зэрэг бүх users функцийг удирдана.
 */
@Module({
  controllers: [UsersController],
  providers: [
    // Use Cases
    CreateUserProfileUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    UpdateUserRoleUseCase,
    ListUsersUseCase,
    DeleteUserUseCase,
    // Infrastructure
    UserProfileRepository,
    UserCacheService,
  ],
  exports: [UserProfileRepository],
})
export class UsersModule {}
