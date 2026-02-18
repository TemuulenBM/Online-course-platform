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
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../common/decorators/public.decorator';

// DTOs
import { CreatePostDto } from '../../dto/create-post.dto';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { CreateReplyDto } from '../../dto/create-reply.dto';
import { UpdateReplyDto } from '../../dto/update-reply.dto';
import { VotePostDto } from '../../dto/vote-post.dto';
import { FlagPostDto } from '../../dto/flag-post.dto';
import { ListPostsQueryDto } from '../../dto/list-posts-query.dto';

// Use Cases
import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
import { ListCoursePostsUseCase } from '../../application/use-cases/list-course-posts.use-case';
import { GetPostUseCase } from '../../application/use-cases/get-post.use-case';
import { UpdatePostUseCase } from '../../application/use-cases/update-post.use-case';
import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case';
import { AddReplyUseCase } from '../../application/use-cases/add-reply.use-case';
import { UpdateReplyUseCase } from '../../application/use-cases/update-reply.use-case';
import { DeleteReplyUseCase } from '../../application/use-cases/delete-reply.use-case';
import { VotePostUseCase } from '../../application/use-cases/vote-post.use-case';
import { AcceptAnswerUseCase } from '../../application/use-cases/accept-answer.use-case';
import { PinPostUseCase } from '../../application/use-cases/pin-post.use-case';
import { LockPostUseCase } from '../../application/use-cases/lock-post.use-case';
import { FlagPostUseCase } from '../../application/use-cases/flag-post.use-case';

/**
 * Хэлэлцүүлгийн нийтлэл controller.
 * Нийтлэл CRUD, хариулт, санал өгөх, хүлээн авах, pin/lock/flag зэрэг endpoint-ууд.
 * Route дараалал: тодорхой path-ууд (:id-ээс ӨМНӨ бүртгэгдэнэ).
 */
@Controller('discussions/posts')
@UseGuards(JwtAuthGuard)
export class DiscussionPostsController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly listCoursePostsUseCase: ListCoursePostsUseCase,
    private readonly getPostUseCase: GetPostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly addReplyUseCase: AddReplyUseCase,
    private readonly updateReplyUseCase: UpdateReplyUseCase,
    private readonly deleteReplyUseCase: DeleteReplyUseCase,
    private readonly votePostUseCase: VotePostUseCase,
    private readonly acceptAnswerUseCase: AcceptAnswerUseCase,
    private readonly pinPostUseCase: PinPostUseCase,
    private readonly lockPostUseCase: LockPostUseCase,
    private readonly flagPostUseCase: FlagPostUseCase,
  ) {}

  // ========================================
  // Тодорхой path-ууд — :id-ээс ӨМНӨ
  // ========================================

  /** Сургалтын нийтлэлүүдийн жагсаалт */
  @Get('course/:courseId')
  @Public()
  async listCoursePosts(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
    @Query() query: ListPostsQueryDto,
  ) {
    return this.listCoursePostsUseCase.execute(courseId, userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      postType: query.postType,
      search: query.search,
      tags: query.tags,
      sortBy: query.sortBy ?? 'newest',
    });
  }

  // ========================================
  // Нийтлэл CRUD
  // ========================================

  /** Нийтлэл үүсгэх */
  @Post()
  async createPost(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreatePostDto,
  ) {
    const post = await this.createPostUseCase.execute(userId, role, dto);
    return post.toResponse(userId);
  }

  /** Нийтлэлийн дэлгэрэнгүй */
  @Get(':id')
  @Public()
  async getPost(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const post = await this.getPostUseCase.execute(id);
    return post.toResponse(userId);
  }

  /** Нийтлэл шинэчлэх */
  @Patch(':id')
  async updatePost(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdatePostDto,
  ) {
    const post = await this.updatePostUseCase.execute(userId, role, id, dto);
    return post.toResponse(userId);
  }

  /** Нийтлэл устгах */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    await this.deletePostUseCase.execute(userId, role, id);
  }

  // ========================================
  // Хариулт удирдлага
  // ========================================

  /** Хариулт нэмэх */
  @Post(':id/replies')
  async addReply(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreateReplyDto,
  ) {
    const post = await this.addReplyUseCase.execute(userId, role, postId, dto);
    return post.toResponse(userId);
  }

  /** Хариулт шинэчлэх */
  @Patch(':id/replies/:replyId')
  async updateReply(
    @Param('id') postId: string,
    @Param('replyId') replyId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateReplyDto,
  ) {
    const post = await this.updateReplyUseCase.execute(userId, role, postId, replyId, dto);
    return post.toResponse(userId);
  }

  /** Хариулт устгах */
  @Delete(':id/replies/:replyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReply(
    @Param('id') postId: string,
    @Param('replyId') replyId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    await this.deleteReplyUseCase.execute(userId, role, postId, replyId);
  }

  // ========================================
  // Санал өгөх + хүлээн авах
  // ========================================

  /** Нийтлэлд санал өгөх (up/down toggle) */
  @Post(':id/vote')
  async votePost(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: VotePostDto,
  ) {
    const post = await this.votePostUseCase.execute(
      userId,
      role,
      postId,
      dto.voteType as 'up' | 'down',
    );
    return post.toResponse(userId);
  }

  /** Хариултыг зөв хариулт болгох */
  @Post(':id/accept/:replyId')
  async acceptAnswer(
    @Param('id') postId: string,
    @Param('replyId') replyId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const post = await this.acceptAnswerUseCase.execute(userId, role, postId, replyId);
    return post.toResponse(userId);
  }

  // ========================================
  // Модератор үйлдлүүд (TEACHER/ADMIN)
  // ========================================

  /** Нийтлэл pin/unpin хийх */
  @Post(':id/pin')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  async pinPost(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const post = await this.pinPostUseCase.execute(userId, role, postId);
    return post.toResponse();
  }

  /** Нийтлэл lock/unlock хийх */
  @Post(':id/lock')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  async lockPost(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const post = await this.lockPostUseCase.execute(userId, role, postId);
    return post.toResponse();
  }

  /** Нийтлэл flag/unflag хийх */
  @Post(':id/flag')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  async flagPost(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: FlagPostDto,
  ) {
    const post = await this.flagPostUseCase.execute(userId, role, postId, dto.flagReason);
    return post.toResponse();
  }
}
