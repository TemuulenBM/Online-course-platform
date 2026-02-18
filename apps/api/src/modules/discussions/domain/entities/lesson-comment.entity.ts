import { CommentReplyVO } from '../value-objects/comment-reply.vo';

/**
 * Хичээлийн сэтгэгдлийн домэйн entity.
 * MongoDB-ийн lesson_comments collection-г бизнес логикийн түвшинд төлөөлнө.
 */
export class LessonCommentEntity {
  readonly id: string;
  readonly lessonId: string;
  readonly userId: string;
  readonly parentCommentId?: string;
  readonly content: string;
  readonly timestampSeconds?: number;
  readonly upvotes: number;
  /** Санал өгсөн хэрэглэгчдийн ID — response-д буцаахгүй */
  readonly upvoterIds: string[];
  readonly replies: CommentReplyVO[];
  readonly isInstructorReply: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    lessonId: string;
    userId: string;
    parentCommentId?: string;
    content: string;
    timestampSeconds?: number;
    upvotes: number;
    upvoterIds: string[];
    replies: CommentReplyVO[];
    isInstructorReply: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.lessonId = props.lessonId;
    this.userId = props.userId;
    this.parentCommentId = props.parentCommentId;
    this.content = props.content;
    this.timestampSeconds = props.timestampSeconds;
    this.upvotes = props.upvotes;
    this.upvoterIds = props.upvoterIds;
    this.replies = props.replies;
    this.isInstructorReply = props.isInstructorReply;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Response хэлбэрээр буцаана — upvoterIds нуугдана, hasUpvoted буцаана */
  toResponse(currentUserId?: string) {
    return {
      id: this.id,
      lessonId: this.lessonId,
      userId: this.userId,
      parentCommentId: this.parentCommentId,
      content: this.content,
      timestampSeconds: this.timestampSeconds,
      upvotes: this.upvotes,
      hasUpvoted: currentUserId ? this.upvoterIds.includes(currentUserId) : false,
      replies: this.replies.map((r) => r.toResponse(currentUserId)),
      isInstructorReply: this.isInstructorReply,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
