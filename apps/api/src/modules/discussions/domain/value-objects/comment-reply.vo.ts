/** Хичээлийн сэтгэгдлийн хариулт value object */
export class CommentReplyVO {
  readonly replyId: string;
  readonly userId: string;
  readonly content: string;
  readonly upvotes: number;
  readonly upvoterIds: string[];
  readonly createdAt: Date;

  constructor(props: {
    replyId: string;
    userId: string;
    content: string;
    upvotes: number;
    upvoterIds: string[];
    createdAt: Date;
  }) {
    this.replyId = props.replyId;
    this.userId = props.userId;
    this.content = props.content;
    this.upvotes = props.upvotes;
    this.upvoterIds = props.upvoterIds;
    this.createdAt = props.createdAt;
  }

  toResponse(currentUserId?: string) {
    return {
      replyId: this.replyId,
      userId: this.userId,
      content: this.content,
      upvotes: this.upvotes,
      hasUpvoted: currentUserId ? this.upvoterIds.includes(currentUserId) : false,
      createdAt: this.createdAt,
    };
  }
}
