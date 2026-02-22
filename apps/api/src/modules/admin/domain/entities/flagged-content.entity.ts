/**
 * Тэмдэглэгдсэн контентийн entity.
 * Moderation жагсаалтад харуулах хялбарчилсан хэлбэр.
 */
export class FlaggedContentItem {
  readonly id: string;
  readonly courseId: string;
  readonly authorId: string;
  readonly postType: string;
  readonly title: string | null;
  readonly contentPreview: string;
  readonly flagReason: string | null;
  readonly isFlagged: boolean;
  readonly isLocked: boolean;
  readonly viewsCount: number;
  readonly createdAt: Date;

  constructor(props: {
    id: string;
    courseId: string;
    authorId: string;
    postType: string;
    title: string | null;
    contentPreview: string;
    flagReason: string | null;
    isFlagged: boolean;
    isLocked: boolean;
    viewsCount: number;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.courseId = props.courseId;
    this.authorId = props.authorId;
    this.postType = props.postType;
    this.title = props.title;
    this.contentPreview = props.contentPreview;
    this.flagReason = props.flagReason;
    this.isFlagged = props.isFlagged;
    this.isLocked = props.isLocked;
    this.viewsCount = props.viewsCount;
    this.createdAt = props.createdAt;
  }

  /** Moderation жагсаалтад буцаах response */
  toResponse() {
    return {
      id: this.id,
      courseId: this.courseId,
      authorId: this.authorId,
      postType: this.postType,
      title: this.title,
      contentPreview: this.contentPreview,
      flagReason: this.flagReason,
      isFlagged: this.isFlagged,
      isLocked: this.isLocked,
      viewsCount: this.viewsCount,
      createdAt: this.createdAt,
    };
  }
}
