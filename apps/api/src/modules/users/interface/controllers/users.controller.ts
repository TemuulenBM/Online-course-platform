import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CreateUserProfileDto } from '../../dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../../dto/update-user-profile.dto';
import { UpdateUserRoleDto } from '../../dto/update-user-role.dto';
import { ListUsersQueryDto } from '../../dto/list-users-query.dto';
import {
  UserProfileResponseDto,
  UserWithProfileResponseDto,
} from '../../dto/user-profile-response.dto';
import { CreateUserProfileUseCase } from '../../application/use-cases/create-user-profile.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { UpdateUserRoleUseCase } from '../../application/use-cases/update-user-role.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';

/**
 * Хэрэглэгчийн controller.
 * Профайл CRUD, role удирдлага, хэрэглэгчдийн жагсаалт зэрэг endpoint-уудыг удирдана.
 */
@ApiTags('Хэрэглэгчид')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly createUserProfileUseCase: CreateUserProfileUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get('me/profile')
  @ApiOperation({ summary: 'Миний профайл авах' })
  @ApiResponse({ status: 200, description: 'Профайлын мэдээлэл', type: UserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'Профайл олдсонгүй' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    const profile = await this.getUserProfileUseCase.execute(userId);
    return profile.toResponse();
  }

  @Post('me/profile')
  @ApiOperation({ summary: 'Миний профайл үүсгэх' })
  @ApiResponse({
    status: 201,
    description: 'Профайл амжилттай үүсгэгдлээ',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Профайл аль хэдийн үүсгэгдсэн' })
  async createMyProfile(@CurrentUser('id') userId: string, @Body() dto: CreateUserProfileDto) {
    const profile = await this.createUserProfileUseCase.execute(userId, dto);
    return profile.toResponse();
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Миний профайл шинэчлэх' })
  @ApiResponse({
    status: 200,
    description: 'Профайл амжилттай шинэчлэгдлээ',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Профайл олдсонгүй' })
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateUserProfileDto,
  ) {
    const profile = await this.updateUserProfileUseCase.execute(userId, userId, role, dto);
    return profile.toResponse();
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Хэрэглэгчийн профайл авах' })
  @ApiResponse({ status: 200, description: 'Профайлын мэдээлэл', type: UserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'Профайл олдсонгүй' })
  async getUserProfile(@Param('id') userId: string) {
    const profile = await this.getUserProfileUseCase.execute(userId);
    return profile.toResponse();
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Хэрэглэгчдийн жагсаалт (Зөвхөн Admin)' })
  @ApiResponse({ status: 200, description: 'Хэрэглэгчдийн жагсаалт' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async listUsers(@Query() query: ListUsersQueryDto) {
    return this.listUsersUseCase.execute(query);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Хэрэглэгчийн эрх солих (Зөвхөн Admin)' })
  @ApiResponse({ status: 200, description: 'Эрх амжилттай өөрчлөгдлөө' })
  @ApiResponse({ status: 404, description: 'Хэрэглэгч олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async updateUserRole(@Param('id') userId: string, @Body() dto: UpdateUserRoleDto) {
    return this.updateUserRoleUseCase.execute(userId, dto.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Хэрэглэгч устгах (Зөвхөн Admin)' })
  @ApiResponse({ status: 204, description: 'Хэрэглэгч амжилттай устгагдлаа' })
  @ApiResponse({ status: 404, description: 'Хэрэглэгч олдсонгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async deleteUser(@Param('id') userId: string) {
    await this.deleteUserUseCase.execute(userId);
  }
}
