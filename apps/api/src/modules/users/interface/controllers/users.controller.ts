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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
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
import { UploadAvatarUseCase } from '../../application/use-cases/upload-avatar.use-case';
import { GetUserStatsUseCase } from '../../application/use-cases/get-user-stats.use-case';

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
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly getUserStatsUseCase: GetUserStatsUseCase,
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

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Аватар зураг upload хийх' })
  @ApiResponse({
    status: 200,
    description: 'Аватар амжилттай шинэчлэгдлээ',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Файлын формат буруу эсвэл хэмжээ хэтэрсэн' })
  @ApiResponse({ status: 404, description: 'Профайл олдсонгүй' })
  async uploadAvatar(@CurrentUser('id') userId: string, @UploadedFile() file: Express.Multer.File) {
    const profile = await this.uploadAvatarUseCase.execute(userId, file);
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

  @Get(':id/stats')
  @ApiOperation({ summary: 'Хэрэглэгчийн статистик авах' })
  @ApiResponse({ status: 200, description: 'Хэрэглэгчийн статистик (enrollment, certificate тоо)' })
  async getUserStats(@Param('id') userId: string) {
    return this.getUserStatsUseCase.execute(userId);
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
