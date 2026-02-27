import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

// Controller
import { UsersController } from './interface/controllers/users.controller';

// Use Cases
import { CreateUserProfileUseCase } from './application/use-cases/create-user-profile.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';
import { UpdateUserRoleUseCase } from './application/use-cases/update-user-role.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { UploadAvatarUseCase } from './application/use-cases/upload-avatar.use-case';
import { GetUserStatsUseCase } from './application/use-cases/get-user-stats.use-case';

// Infrastructure
import { UserProfileRepository } from './infrastructure/repositories/user-profile.repository';
import { UserCacheService } from './infrastructure/services/user-cache.service';

// Storage — Content модулийн pattern дахин ашиглах
import { STORAGE_SERVICE } from '../content/infrastructure/services/storage/storage.interface';
import { LocalStorageService } from '../content/infrastructure/services/storage/local-storage.service';

/**
 * Users модуль.
 * Хэрэглэгчийн профайл CRUD, role удирдлага, хэрэглэгчдийн жагсаалт,
 * кэшлэлт, аватар upload зэрэг бүх users функцийг удирдана.
 */
@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [UsersController],
  providers: [
    // Use Cases
    CreateUserProfileUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    UpdateUserRoleUseCase,
    ListUsersUseCase,
    DeleteUserUseCase,
    UploadAvatarUseCase,
    GetUserStatsUseCase,
    // Infrastructure
    UserProfileRepository,
    UserCacheService,
    // Storage — interface-based DI, ирээдүйд S3/R2 руу солих боломжтой
    {
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
  ],
  exports: [UserProfileRepository],
})
export class UsersModule {}
