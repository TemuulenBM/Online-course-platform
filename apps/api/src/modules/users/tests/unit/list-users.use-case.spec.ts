import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { UserProfileRepository } from '../../infrastructure/repositories/user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let userProfileRepository: jest.Mocked<UserProfileRepository>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersUseCase,
        {
          provide: UserProfileRepository,
          useValue: {
            findManyWithUser: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
    userProfileRepository = module.get(UserProfileRepository);
  });

  it('хэрэглэгчдийн жагсаалт амжилттай авах', async () => {
    const mockData = {
      data: [
        {
          id: 'user-id-1',
          email: 'test@example.com',
          role: 'STUDENT' as const,
          emailVerified: false,
          createdAt: new Date(),
          profile: mockProfile,
        },
        {
          id: 'user-id-2',
          email: 'teacher@example.com',
          role: 'TEACHER' as const,
          emailVerified: true,
          createdAt: new Date(),
          profile: null,
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
    };

    userProfileRepository.findManyWithUser.mockResolvedValue(mockData);

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe('user-id-1');
    expect(result.data[0].email).toBe('test@example.com');
    expect(result.data[0].profile).toBeDefined();
    expect(result.data[1].profile).toBeNull();
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(userProfileRepository.findManyWithUser).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      role: undefined,
    });
  });

  it('хоосон жагсаалт', async () => {
    const mockData = {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    };

    userProfileRepository.findManyWithUser.mockResolvedValue(mockData);

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
    expect(result.meta).toEqual({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
  });
});
