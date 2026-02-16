import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../interface/controllers/users.controller';
import { CreateUserProfileUseCase } from '../../application/use-cases/create-user-profile.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { UpdateUserRoleUseCase } from '../../application/use-cases/update-user-role.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let createUserProfileUseCase: jest.Mocked<CreateUserProfileUseCase>;
  let getUserProfileUseCase: jest.Mocked<GetUserProfileUseCase>;
  let updateUserProfileUseCase: jest.Mocked<UpdateUserProfileUseCase>;
  let updateUserRoleUseCase: jest.Mocked<UpdateUserRoleUseCase>;
  let listUsersUseCase: jest.Mocked<ListUsersUseCase>;
  let deleteUserUseCase: jest.Mocked<DeleteUserUseCase>;

  /** Тестэд ашиглах mock профайл */
  const mockProfile = new UserProfileEntity({
    id: 'profile-id-1',
    userId: 'user-id-1',
    firstName: 'Бат',
    lastName: 'Дорж',
    avatarUrl: null,
    bio: null,
    country: null,
    timezone: null,
    preferences: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Профайлын response хэлбэр */
  const mockProfileResponse = mockProfile.toResponse();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CreateUserProfileUseCase, useValue: { execute: jest.fn() } },
        { provide: GetUserProfileUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateUserProfileUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateUserRoleUseCase, useValue: { execute: jest.fn() } },
        { provide: ListUsersUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteUserUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    createUserProfileUseCase = module.get(CreateUserProfileUseCase);
    getUserProfileUseCase = module.get(GetUserProfileUseCase);
    updateUserProfileUseCase = module.get(UpdateUserProfileUseCase);
    updateUserRoleUseCase = module.get(UpdateUserRoleUseCase);
    listUsersUseCase = module.get(ListUsersUseCase);
    deleteUserUseCase = module.get(DeleteUserUseCase);
  });

  describe('getMyProfile', () => {
    it('GET /users/me/profile — миний профайл авах', async () => {
      getUserProfileUseCase.execute.mockResolvedValue(mockProfile);

      const result = await controller.getMyProfile('user-id-1');

      expect(result).toEqual(mockProfileResponse);
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('createMyProfile', () => {
    it('POST /users/me/profile — профайл үүсгэх', async () => {
      createUserProfileUseCase.execute.mockResolvedValue(mockProfile);

      const dto = { firstName: 'Бат', lastName: 'Дорж' };
      const result = await controller.createMyProfile('user-id-1', dto);

      expect(result).toEqual(mockProfileResponse);
      expect(createUserProfileUseCase.execute).toHaveBeenCalledWith('user-id-1', dto);
    });
  });

  describe('updateMyProfile', () => {
    it('PATCH /users/me/profile — профайл шинэчлэх', async () => {
      updateUserProfileUseCase.execute.mockResolvedValue(mockProfile);

      const dto = { firstName: 'Батболд' };
      const result = await controller.updateMyProfile('user-id-1', 'STUDENT', dto);

      expect(result).toEqual(mockProfileResponse);
      expect(updateUserProfileUseCase.execute).toHaveBeenCalledWith(
        'user-id-1',
        'user-id-1',
        'STUDENT',
        dto,
      );
    });
  });

  describe('getUserProfile', () => {
    it('GET /users/:id/profile — бусдын профайл авах', async () => {
      getUserProfileUseCase.execute.mockResolvedValue(mockProfile);

      const result = await controller.getUserProfile('user-id-1');

      expect(result).toEqual(mockProfileResponse);
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('listUsers', () => {
    it('GET /users — жагсаалт авах', async () => {
      const mockListResponse = {
        data: [
          {
            id: 'user-id-1',
            email: 'test@example.com',
            role: 'STUDENT',
            emailVerified: false,
            createdAt: new Date(),
            profile: mockProfileResponse,
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      listUsersUseCase.execute.mockResolvedValue(mockListResponse);

      const query = { page: 1, limit: 20 };
      const result = await controller.listUsers(query);

      expect(result).toEqual(mockListResponse);
      expect(listUsersUseCase.execute).toHaveBeenCalledWith(query);
    });
  });

  describe('updateUserRole', () => {
    it('PATCH /users/:id/role — эрх солих', async () => {
      const mockRoleResponse = {
        id: 'user-id-1',
        email: 'test@example.com',
        role: 'TEACHER' as const,
      };

      updateUserRoleUseCase.execute.mockResolvedValue(mockRoleResponse);

      const dto = { role: 'TEACHER' as any };
      const result = await controller.updateUserRole('user-id-1', dto);

      expect(result).toEqual(mockRoleResponse);
      expect(updateUserRoleUseCase.execute).toHaveBeenCalledWith('user-id-1', 'TEACHER');
    });
  });

  describe('deleteUser', () => {
    it('DELETE /users/:id — хэрэглэгч устгах', async () => {
      deleteUserUseCase.execute.mockResolvedValue(undefined);

      await controller.deleteUser('user-id-1');

      expect(deleteUserUseCase.execute).toHaveBeenCalledWith('user-id-1');
    });
  });
});
