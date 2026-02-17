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
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { SetTextContentDto } from '../../dto/set-text-content.dto';
import { SetVideoContentDto } from '../../dto/set-video-content.dto';
import { UpdateTextContentDto } from '../../dto/update-text-content.dto';
import { UpdateVideoContentDto } from '../../dto/update-video-content.dto';
import { SetContentUseCase } from '../../application/use-cases/set-content.use-case';
import { GetContentUseCase } from '../../application/use-cases/get-content.use-case';
import { UpdateContentUseCase } from '../../application/use-cases/update-content.use-case';
import { DeleteContentUseCase } from '../../application/use-cases/delete-content.use-case';
import {
  UploadFileUseCase,
  FileType,
} from '../../application/use-cases/upload-file.use-case';

/**
 * Контент controller.
 * Хичээлийн контент (видео, текст, хавсралт) удирдах REST endpoint-ууд.
 */
@ApiTags('Контент')
@Controller('content')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContentController {
  constructor(
    private readonly setContentUseCase: SetContentUseCase,
    private readonly getContentUseCase: GetContentUseCase,
    private readonly updateContentUseCase: UpdateContentUseCase,
    private readonly deleteContentUseCase: DeleteContentUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
  ) {}

  /** POST /content/text — Текст контент тавих */
  @Post('text')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Текст контент тавих (Багш/Админ)' })
  @ApiResponse({ status: 201, description: 'Текст контент амжилттай тавигдлаа' })
  async setTextContent(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: SetTextContentDto,
  ) {
    const content = await this.setContentUseCase.executeText(userId, role, dto);
    return content.toResponse();
  }

  /** POST /content/video — Видео контент тавих */
  @Post('video')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Видео контент тавих (Багш/Админ)' })
  @ApiResponse({ status: 201, description: 'Видео контент амжилттай тавигдлаа' })
  async setVideoContent(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: SetVideoContentDto,
  ) {
    const content = await this.setContentUseCase.executeVideo(
      userId,
      role,
      dto,
    );
    return content.toResponse();
  }

  /** GET /content/lesson/:lessonId — Хичээлийн контент авах */
  @Public()
  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Хичээлийн контент авах (Нийтийн)' })
  @ApiResponse({ status: 200, description: 'Контент амжилттай авлаа' })
  async getByLessonId(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') role?: string,
  ) {
    const content = await this.getContentUseCase.execute(lessonId, {
      currentUserId: userId,
      currentUserRole: role,
    });
    return content.toResponse();
  }

  /** PATCH /content/lesson/:lessonId — Контент шинэчлэх */
  @Patch('lesson/:lessonId')
  @ApiOperation({ summary: 'Контент шинэчлэх (Эзэмшигч/Админ)' })
  @ApiResponse({ status: 200, description: 'Контент амжилттай шинэчлэгдлээ' })
  async updateContent(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateTextContentDto,
  ) {
    const content = await this.updateContentUseCase.execute(
      lessonId,
      userId,
      role,
      dto,
    );
    return content.toResponse();
  }

  /** DELETE /content/lesson/:lessonId — Контент устгах */
  @Delete('lesson/:lessonId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Контент устгах (Эзэмшигч/Админ)' })
  @ApiResponse({ status: 204, description: 'Контент амжилттай устгагдлаа' })
  async deleteContent(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    await this.deleteContentUseCase.execute(lessonId, userId, role);
  }

  /** POST /content/lesson/:lessonId/upload — Файл upload */
  @Post('lesson/:lessonId/upload')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (_req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Файл upload хийх (Багш/Админ)' })
  @ApiResponse({ status: 201, description: 'Файл амжилттай upload хийгдлээ' })
  async uploadFile(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('fileType') fileType: FileType,
  ) {
    const content = await this.uploadFileUseCase.execute(
      lessonId,
      userId,
      role,
      file,
      fileType,
    );
    return content.toResponse();
  }
}
