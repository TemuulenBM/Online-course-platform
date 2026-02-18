import { ReplyVO } from '../value-objects/reply.vo';
import { VoterVO } from '../value-objects/voter.vo';

/**
 * Хэлэлцүүлгийн нийтлэлийн домэйн entity.
 * MongoDB-ийн discussion_posts collection-г бизнес логикийн түвшинд төлөөлнө.
 */
export class DiscussionPostEntity {
  readonly id: string;
  readonly courseId: string;
  readonly lessonId?: string;
  readonly threadId?: string;
  readonly authorId: string;
  readonly postType: string;
  readonly title?: string;
  readonly content: string;
  readonly contentHtml: string;
  readonly isAnswered: boolean;
  readonly acceptedAnswerId?: string;
  readonly upvotes: number;
  readonly downvotes: number;
  readonly voteScore: number;
  readonly replies: ReplyVO[];
  /** Санал өгсөн хэрэглэгчид — response-д буцаахгүй */
  readonly voters: VoterVO[];
  readonly tags: string[];
  readonly viewsCount: number;
  readonly isPinned: boolean;
  readonly isLocked: boolean;
  readonly isFlagged: boolean;
  readonly flagReason?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    courseId: string;
    lessonId?: string;
    threadId?: string;
    authorId: string;
    postType: string;
    title?: string;
    content: string;
    contentHtml: string;
    isAnswered: boolean;
    acceptedAnswerId?: string;
    upvotes: number;
    downvotes: number;
    voteScore: number;
    replies: ReplyVO[];
    voters: VoterVO[];
    tags: string[];
    viewsCount: number;
    isPinned: boolean;
    isLocked: boolean;
    isFlagged: boolean;
    flagReason?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.courseId = props.courseId;
    this.lessonId = props.lessonId;
    this.threadId = props.threadId;
    this.authorId = props.authorId;
    this.postType = props.postType;
    this.title = props.title;
    this.content = props.content;
    this.contentHtml = props.contentHtml;
    this.isAnswered = props.isAnswered;
    this.acceptedAnswerId = props.acceptedAnswerId;
    this.upvotes = props.upvotes;
    this.downvotes = props.downvotes;
    this.voteScore = props.voteScore;
    this.replies = props.replies;
    this.voters = props.voters;
    this.tags = props.tags;
    this.viewsCount = props.viewsCount;
    this.isPinned = props.isPinned;
    this.isLocked = props.isLocked;
    this.isFlagged = props.isFlagged;
    this.flagReason = props.flagReason;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Дэлгэрэнгүй response — voters нуугдана, userVote буцаана */
  toResponse(currentUserId?: string) {
    const userVoter = currentUserId
      ? this.voters.find((v) => v.userId === currentUserId)
      : undefined;

    return {
      id: this.id,
      courseId: this.courseId,
      lessonId: this.lessonId,
      threadId: this.threadId,
      authorId: this.authorId,
      postType: this.postType,
      title: this.title,
      content: this.content,
      contentHtml: this.contentHtml,
      isAnswered: this.isAnswered,
      acceptedAnswerId: this.acceptedAnswerId,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      voteScore: this.voteScore,
      replies: this.replies.map((r) => r.toResponse()),
      tags: this.tags,
      viewsCount: this.viewsCount,
      isPinned: this.isPinned,
      isLocked: this.isLocked,
      isFlagged: this.isFlagged,
      flagReason: this.flagReason,
      userVote: userVoter?.voteType ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /** Жагсаалтанд зориулсан хялбаршуулсан response (replies-гүй) */
  toListResponse(currentUserId?: string) {
    const userVoter = currentUserId
      ? this.voters.find((v) => v.userId === currentUserId)
      : undefined;

    return {
      id: this.id,
      courseId: this.courseId,
      lessonId: this.lessonId,
      authorId: this.authorId,
      postType: this.postType,
      title: this.title,
      isAnswered: this.isAnswered,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      voteScore: this.voteScore,
      replyCount: this.replies.length,
      tags: this.tags,
      viewsCount: this.viewsCount,
      isPinned: this.isPinned,
      isLocked: this.isLocked,
      isFlagged: this.isFlagged,
      userVote: userVoter?.voteType ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
