import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import {
  DiscussionPost,
  DiscussionPostSchema,
} from './infrastructure/schemas/discussion-post.schema';
import { LessonComment, LessonCommentSchema } from './infrastructure/schemas/lesson-comment.schema';

// Repositories
import { DiscussionPostRepository } from './infrastructure/repositories/discussion-post.repository';
import { LessonCommentRepository } from './infrastructure/repositories/lesson-comment.repository';

// Services
import { DiscussionCacheService } from './infrastructure/services/discussion-cache.service';

// Use Cases — Discussion Posts
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { ListCoursePostsUseCase } from './application/use-cases/list-course-posts.use-case';
import { GetPostUseCase } from './application/use-cases/get-post.use-case';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { AddReplyUseCase } from './application/use-cases/add-reply.use-case';
import { UpdateReplyUseCase } from './application/use-cases/update-reply.use-case';
import { DeleteReplyUseCase } from './application/use-cases/delete-reply.use-case';
import { VotePostUseCase } from './application/use-cases/vote-post.use-case';
import { AcceptAnswerUseCase } from './application/use-cases/accept-answer.use-case';
import { PinPostUseCase } from './application/use-cases/pin-post.use-case';
import { LockPostUseCase } from './application/use-cases/lock-post.use-case';
import { FlagPostUseCase } from './application/use-cases/flag-post.use-case';

// Use Cases — Lesson Comments
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { ListLessonCommentsUseCase } from './application/use-cases/list-lesson-comments.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { AddCommentReplyUseCase } from './application/use-cases/add-comment-reply.use-case';
import { UpvoteCommentUseCase } from './application/use-cases/upvote-comment.use-case';

// Controllers
import { DiscussionPostsController } from './interface/controllers/discussion-posts.controller';
import { LessonCommentsController } from './interface/controllers/lesson-comments.controller';

// Хамааралтай модулиудын repository-нуудыг авахын тулд import
import { CoursesModule } from '../courses/courses.module';
import { LessonsModule } from '../lessons/lessons.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiscussionPost.name, schema: DiscussionPostSchema },
      { name: LessonComment.name, schema: LessonCommentSchema },
    ]),
    CoursesModule,
    LessonsModule,
    EnrollmentsModule,
  ],
  controllers: [DiscussionPostsController, LessonCommentsController],
  providers: [
    // Repositories
    DiscussionPostRepository,
    LessonCommentRepository,
    // Services
    DiscussionCacheService,
    // Use Cases — Discussion Posts
    CreatePostUseCase,
    ListCoursePostsUseCase,
    GetPostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    AddReplyUseCase,
    UpdateReplyUseCase,
    DeleteReplyUseCase,
    VotePostUseCase,
    AcceptAnswerUseCase,
    PinPostUseCase,
    LockPostUseCase,
    FlagPostUseCase,
    // Use Cases — Lesson Comments
    CreateCommentUseCase,
    ListLessonCommentsUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
    AddCommentReplyUseCase,
    UpvoteCommentUseCase,
  ],
  exports: [DiscussionPostRepository, LessonCommentRepository],
})
export class DiscussionsModule {}
