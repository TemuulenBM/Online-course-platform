/** Хэлэлцүүлгийн хариулт value object */
export class ReplyVO {
  readonly replyId: string;
  readonly authorId: string;
  readonly content: string;
  readonly contentHtml: string;
  readonly upvotes: number;
  readonly downvotes: number;
  readonly isAccepted: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    replyId: string;
    authorId: string;
    content: string;
    contentHtml: string;
    upvotes: number;
    downvotes: number;
    isAccepted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.replyId = props.replyId;
    this.authorId = props.authorId;
    this.content = props.content;
    this.contentHtml = props.contentHtml;
    this.upvotes = props.upvotes;
    this.downvotes = props.downvotes;
    this.isAccepted = props.isAccepted;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  toResponse() {
    return {
      replyId: this.replyId,
      authorId: this.authorId,
      content: this.content,
      contentHtml: this.contentHtml,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      isAccepted: this.isAccepted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
