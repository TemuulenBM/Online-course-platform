import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, SortOrder } from 'mongoose';
import { LessonComment, LessonCommentDocument } from '../schemas/lesson-comment.schema';
import { LessonCommentEntity } from '../../domain/entities/lesson-comment.entity';
import { CommentReplyVO } from '../../domain/value-objects/comment-reply.vo';

/**
 * Хичээлийн сэтгэгдэл repository.
 * MongoDB-ийн lesson_comments collection-тэй харьцах CRUD үйлдлүүд.
 */
@Injectable()
export class LessonCommentRepository {
  private readonly logger = new Logger(LessonCommentRepository.name);

  constructor(
    @InjectModel(LessonComment.name)
    private readonly commentModel: Model<LessonCommentDocument>,
  ) {}

  /** Сэтгэгдэл үүсгэх */
  async create(data: {
    lessonId: string;
    userId: string;
    parentCommentId?: string;
    content: string;
    timestampSeconds?: number;
    isInstructorReply: boolean;
  }): Promise<LessonCommentEntity> {
    const doc = await this.commentModel.create(data);
    this.logger.debug(`Сэтгэгдэл үүсгэгдлээ: ${doc._id}, lessonId=${data.lessonId}`);
    return this.toEntity(doc);
  }

  /** ID-аар олох */
  async findById(id: string): Promise<LessonCommentEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.commentModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Хичээлээр жагсаалт (pagination, sort) */
  async findByLessonId(
    lessonId: string,
    options: {
      page: number;
      limit: number;
      sortBy?: 'newest' | 'upvotes' | 'timestamp';
    },
  ): Promise<{
    data: LessonCommentEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, sortBy = 'newest' } = options;
    const skip = (page - 1) * limit;

    const sortOptions: Record<string, SortOrder> = {};
    switch (sortBy) {
      case 'upvotes':
        sortOptions.upvotes = -1;
        break;
      case 'timestamp':
        sortOptions.timestampSeconds = 1;
        break;
      case 'newest':
      default:
        sortOptions.createdAt = -1;
        break;
    }

    const filter = { lessonId, parentCommentId: { $exists: false } };

    const [docs, total] = await Promise.all([
      this.commentModel.find(filter).sort(sortOptions).skip(skip).limit(limit).exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);

    return {
      data: docs.map((doc) => this.toEntity(doc)),
      total,
      page,
      limit,
    };
  }

  /** Сэтгэгдэл шинэчлэх */
  async update(id: string, data: { content: string }): Promise<LessonCommentEntity | null> {
    const doc = await this.commentModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
    if (doc) {
      this.logger.debug(`Сэтгэгдэл шинэчлэгдлээ: ${id}`);
    }
    return doc ? this.toEntity(doc) : null;
  }

  /** Сэтгэгдэл устгах */
  async delete(id: string): Promise<void> {
    await this.commentModel.findByIdAndDelete(id).exec();
    this.logger.debug(`Сэтгэгдэл устгагдлаа: ${id}`);
  }

  /** Хариулт нэмэх */
  async addReply(
    id: string,
    reply: {
      replyId: string;
      userId: string;
      content: string;
    },
  ): Promise<LessonCommentEntity | null> {
    const doc = await this.commentModel
      .findByIdAndUpdate(
        id,
        {
          $push: {
            replies: {
              ...reply,
              upvotes: 0,
              upvoterIds: [],
              createdAt: new Date(),
            },
          },
        },
        { new: true },
      )
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Сэтгэгдэлд upvote toggle */
  async toggleUpvote(id: string, userId: string): Promise<LessonCommentEntity | null> {
    const doc = await this.commentModel.findById(id).exec();
    if (!doc) return null;

    const hasUpvoted = doc.upvoterIds.includes(userId);

    const updated = await this.commentModel
      .findByIdAndUpdate(
        id,
        hasUpvoted
          ? {
              $pull: { upvoterIds: userId },
              $inc: { upvotes: -1 },
            }
          : {
              $addToSet: { upvoterIds: userId },
              $inc: { upvotes: 1 },
            },
        { new: true },
      )
      .exec();

    return updated ? this.toEntity(updated) : null;
  }

  /** Хариултанд upvote toggle */
  async toggleReplyUpvote(
    id: string,
    replyId: string,
    userId: string,
  ): Promise<LessonCommentEntity | null> {
    const doc = await this.commentModel.findById(id).exec();
    if (!doc) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reply = doc.replies.find((r: any) => r.replyId === replyId);
    if (!reply) return null;

    const hasUpvoted = reply.upvoterIds.includes(userId);

    const updated = await this.commentModel
      .findOneAndUpdate(
        { _id: id, 'replies.replyId': replyId },
        hasUpvoted
          ? {
              $pull: { 'replies.$.upvoterIds': userId },
              $inc: { 'replies.$.upvotes': -1 },
            }
          : {
              $addToSet: { 'replies.$.upvoterIds': userId },
              $inc: { 'replies.$.upvotes': 1 },
            },
        { new: true },
      )
      .exec();

    return updated ? this.toEntity(updated) : null;
  }

  /** MongoDB document-г entity рүү хөрвүүлэх */
  private toEntity(doc: LessonCommentDocument): LessonCommentEntity {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plain: Record<string, any> = doc.toObject();

    const replies = (plain.replies ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: Record<string, any>) =>
        new CommentReplyVO({
          replyId: r.replyId,
          userId: r.userId,
          content: r.content,
          upvotes: r.upvotes ?? 0,
          upvoterIds: r.upvoterIds ?? [],
          createdAt: r.createdAt,
        }),
    );

    return new LessonCommentEntity({
      id: plain._id.toString(),
      lessonId: plain.lessonId,
      userId: plain.userId,
      parentCommentId: plain.parentCommentId,
      content: plain.content,
      timestampSeconds: plain.timestampSeconds,
      upvotes: plain.upvotes ?? 0,
      upvoterIds: plain.upvoterIds ?? [],
      replies,
      isInstructorReply: plain.isInstructorReply ?? false,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    });
  }
}
