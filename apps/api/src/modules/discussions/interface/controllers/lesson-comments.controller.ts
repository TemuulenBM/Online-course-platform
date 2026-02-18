import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../common/decorators/public.decorator';

// DTOs
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CreateCommentReplyDto } from '../../dto/create-comment-reply.dto';
import { ListCommentsQueryDto } from '../../dto/list-comments-query.dto';

// Use Cases
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { ListLessonCommentsUseCase } from '../../application/use-cases/list-lesson-comments.use-case';
import { UpdateCommentUseCase } from '../../application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
import { AddCommentReplyUseCase } from '../../application/use-cases/add-comment-reply.use-case';
import { UpvoteCommentUseCase } from '../../application/use-cases/upvote-comment.use-case';

/**
 * Хичээлийн сэтгэгдэл controller.
 * Сэтгэгдэл CRUD, хариулт, upvote toggle endpoint-ууд.
 * Route дараалал: тодорхой path-ууд (:id-ээс ӨМНӨ бүртгэгдэнэ).
 */
@Controller('discussions/comments')
@UseGuards(JwtAuthGuard)
export class LessonCommentsController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly listLessonCommentsUseCase: ListLessonCommentsUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
    private readonly addCommentReplyUseCase: AddCommentReplyUseCase,
    private readonly upvoteCommentUseCase: UpvoteCommentUseCase,
  ) {}

  // ========================================
  // Тодорхой path-ууд — :id-ээс ӨМНӨ
  // ========================================

  /** Хичээлийн сэтгэгдлүүдийн жагсаалт */
  @Get('lesson/:lessonId')
  @Public()
  async listLessonComments(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
    @Query() query: ListCommentsQueryDto,
  ) {
    return this.listLessonCommentsUseCase.execute(lessonId, userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sortBy: query.sortBy ?? 'newest',
    });
  }

  // ========================================
  // Сэтгэгдэл CRUD
  // ========================================

  /** Сэтгэгдэл үүсгэх */
  @Post()
  async createComment(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.createCommentUseCase.execute(userId, role, dto);
    return comment.toResponse(userId);
  }

  /** Сэтгэгдэл шинэчлэх */
  @Patch(':id')
  async updateComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateCommentDto,
  ) {
    const comment = await this.updateCommentUseCase.execute(id, userId, role, dto);
    return comment.toResponse(userId);
  }

  /** Сэтгэгдэл устгах */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    await this.deleteCommentUseCase.execute(id, userId, role);
  }

  // ========================================
  // Хариулт + Upvote
  // ========================================

  /** Сэтгэгдэлд хариулт нэмэх */
  @Post(':id/replies')
  async addReply(
    @Param('id') commentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreateCommentReplyDto,
  ) {
    const comment = await this.addCommentReplyUseCase.execute(commentId, userId, role, dto);
    return comment.toResponse(userId);
  }

  /** Сэтгэгдэлд upvote toggle */
  @Post(':id/upvote')
  async upvoteComment(
    @Param('id') commentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const comment = await this.upvoteCommentUseCase.execute(commentId, userId, role);
    return comment.toResponse(userId);
  }
}
