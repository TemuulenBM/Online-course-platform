import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** Хэлэлцүүлгийн хариулт */
export class PostReply {
  @Prop({ required: true })
  replyId!: string;

  @Prop({ required: true })
  authorId!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  contentHtml!: string;

  @Prop({ default: 0 })
  upvotes!: number;

  @Prop({ default: 0 })
  downvotes!: number;

  @Prop({ default: false })
  isAccepted!: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;
}

/** Санал өгсөн хэрэглэгч */
export class PostVoter {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, enum: ['up', 'down'] })
  voteType!: string;
}

/**
 * Хэлэлцүүлгийн нийтлэл schema.
 * MongoDB-ийн discussion_posts collection-д хадгалагдана.
 * Сургалтын форум, Q&A, хэлэлцүүлгийн бүх нийтлэлүүдийг хадгална.
 */
@Schema({
  collection: 'discussion_posts',
  timestamps: true,
})
export class DiscussionPost {
  @Prop({ required: true, index: true })
  courseId!: string;

  @Prop({ index: true })
  lessonId?: string;

  @Prop()
  threadId?: string;

  @Prop({ required: true, index: true })
  authorId!: string;

  @Prop({
    required: true,
    enum: ['question', 'answer', 'discussion', 'comment'],
  })
  postType!: string;

  @Prop()
  title?: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  contentHtml!: string;

  @Prop({ default: false })
  isAnswered!: boolean;

  @Prop()
  acceptedAnswerId?: string;

  @Prop({ default: 0 })
  upvotes!: number;

  @Prop({ default: 0 })
  downvotes!: number;

  @Prop({ default: 0 })
  voteScore!: number;

  @Prop({ type: [PostReply], default: [] })
  replies!: PostReply[];

  @Prop({ type: [PostVoter], default: [] })
  voters!: PostVoter[];

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: 0 })
  viewsCount!: number;

  @Prop({ default: false })
  isPinned!: boolean;

  @Prop({ default: false })
  isLocked!: boolean;

  @Prop({ default: false })
  isFlagged!: boolean;

  @Prop()
  flagReason?: string;
}

export type DiscussionPostDocument = HydratedDocument<DiscussionPost>;
export const DiscussionPostSchema = SchemaFactory.createForClass(DiscussionPost);

/** Compound indexes */
DiscussionPostSchema.index({ courseId: 1, createdAt: -1 });
DiscussionPostSchema.index({ courseId: 1, postType: 1 });
DiscussionPostSchema.index(
  { title: 'text', content: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, content: 1 } },
);
