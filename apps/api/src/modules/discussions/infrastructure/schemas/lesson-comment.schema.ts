import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** Хичээлийн сэтгэгдлийн хариулт */
export class CommentReply {
  @Prop({ required: true })
  replyId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: 0 })
  upvotes!: number;

  @Prop({ type: [String], default: [] })
  upvoterIds!: string[];

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

/**
 * Хичээлийн сэтгэгдэл schema.
 * MongoDB-ийн lesson_comments collection-д хадгалагдана.
 * Хичээл дээрх сэтгэгдэл, видео timestamp-тэй сэтгэгдлүүдийг хадгална.
 */
@Schema({
  collection: 'lesson_comments',
  timestamps: true,
})
export class LessonComment {
  @Prop({ required: true, index: true })
  lessonId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop()
  parentCommentId?: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: Number })
  timestampSeconds?: number;

  @Prop({ default: 0 })
  upvotes!: number;

  @Prop({ type: [String], default: [] })
  upvoterIds!: string[];

  @Prop({ type: [CommentReply], default: [] })
  replies!: CommentReply[];

  @Prop({ default: false })
  isInstructorReply!: boolean;
}

export type LessonCommentDocument = HydratedDocument<LessonComment>;
export const LessonCommentSchema = SchemaFactory.createForClass(LessonComment);

/** Compound index */
LessonCommentSchema.index({ lessonId: 1, createdAt: -1 });
