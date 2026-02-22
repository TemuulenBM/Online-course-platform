import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, SortOrder } from 'mongoose';
import { DiscussionPost, DiscussionPostDocument } from '../schemas/discussion-post.schema';
import { DiscussionPostEntity } from '../../domain/entities/discussion-post.entity';
import { ReplyVO } from '../../domain/value-objects/reply.vo';
import { VoterVO } from '../../domain/value-objects/voter.vo';

/**
 * Хэлэлцүүлгийн нийтлэл repository.
 * MongoDB-ийн discussion_posts collection-тэй харьцах CRUD үйлдлүүд.
 */
@Injectable()
export class DiscussionPostRepository {
  private readonly logger = new Logger(DiscussionPostRepository.name);

  constructor(
    @InjectModel(DiscussionPost.name)
    private readonly postModel: Model<DiscussionPostDocument>,
  ) {}

  /** Нийтлэл үүсгэх */
  async create(data: {
    courseId: string;
    lessonId?: string;
    authorId: string;
    postType: string;
    title?: string;
    content: string;
    contentHtml: string;
    tags?: string[];
  }): Promise<DiscussionPostEntity> {
    const doc = await this.postModel.create(data);
    this.logger.debug(`Нийтлэл үүсгэгдлээ: ${doc._id}, courseId=${data.courseId}`);
    return this.toEntity(doc);
  }

  /** ID-аар олох */
  async findById(id: string): Promise<DiscussionPostEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.postModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Сургалтаар жагсаалт (pagination, filter, search, sort) */
  async findByCourseId(
    courseId: string,
    options: {
      page: number;
      limit: number;
      postType?: string;
      tags?: string[];
      search?: string;
      sortBy?: 'newest' | 'votes' | 'views';
    },
  ): Promise<{
    data: DiscussionPostEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, postType, tags, search, sortBy = 'newest' } = options;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<DiscussionPostDocument> = { courseId };

    if (postType) {
      filter.postType = postType;
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    /** Эрэмбэлэлт — isPinned эхэнд */
    const sortOptions: Record<string, SortOrder> = { isPinned: -1 };
    switch (sortBy) {
      case 'votes':
        sortOptions.voteScore = -1;
        break;
      case 'views':
        sortOptions.viewsCount = -1;
        break;
      case 'newest':
      default:
        sortOptions.createdAt = -1;
        break;
    }

    const [docs, total] = await Promise.all([
      this.postModel.find(filter).sort(sortOptions).skip(skip).limit(limit).exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    return {
      data: docs.map((doc) => this.toEntity(doc)),
      total,
      page,
      limit,
    };
  }

  /** Нийтлэл шинэчлэх */
  async update(
    id: string,
    data: Partial<{
      title: string;
      content: string;
      contentHtml: string;
      tags: string[];
    }>,
  ): Promise<DiscussionPostEntity | null> {
    const doc = await this.postModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
    if (doc) {
      this.logger.debug(`Нийтлэл шинэчлэгдлээ: ${id}`);
    }
    return doc ? this.toEntity(doc) : null;
  }

  /** Нийтлэл устгах */
  async delete(id: string): Promise<void> {
    await this.postModel.findByIdAndDelete(id).exec();
    this.logger.debug(`Нийтлэл устгагдлаа: ${id}`);
  }

  /** Үзсэн тоо нэмэх */
  async incrementViewCount(id: string): Promise<void> {
    await this.postModel.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } }).exec();
  }

  /** Санал өгөх — toggle логик use-case түвшинд шийдэгдэнэ */
  async addVote(
    id: string,
    userId: string,
    voteType: 'up' | 'down',
  ): Promise<DiscussionPostEntity | null> {
    const incField = voteType === 'up' ? 'upvotes' : 'downvotes';
    const doc = await this.postModel
      .findByIdAndUpdate(
        id,
        {
          $push: { voters: { userId, voteType } },
          $inc: { [incField]: 1, voteScore: voteType === 'up' ? 1 : -1 },
        },
        { new: true },
      )
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Санал хасах */
  async removeVote(
    id: string,
    userId: string,
    previousVoteType: 'up' | 'down',
  ): Promise<DiscussionPostEntity | null> {
    const decField = previousVoteType === 'up' ? 'upvotes' : 'downvotes';
    const doc = await this.postModel
      .findByIdAndUpdate(
        id,
        {
          $pull: { voters: { userId } },
          $inc: {
            [decField]: -1,
            voteScore: previousVoteType === 'up' ? -1 : 1,
          },
        },
        { new: true },
      )
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Хариулт нэмэх */
  async addReply(
    id: string,
    reply: {
      replyId: string;
      authorId: string;
      content: string;
      contentHtml: string;
    },
  ): Promise<DiscussionPostEntity | null> {
    const now = new Date();
    const doc = await this.postModel
      .findByIdAndUpdate(
        id,
        {
          $push: {
            replies: {
              ...reply,
              upvotes: 0,
              downvotes: 0,
              isAccepted: false,
              createdAt: now,
              updatedAt: now,
            },
          },
        },
        { new: true },
      )
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Хариулт шинэчлэх */
  async updateReply(
    id: string,
    replyId: string,
    data: { content: string; contentHtml: string },
  ): Promise<DiscussionPostEntity | null> {
    const doc = await this.postModel
      .findOneAndUpdate(
        { _id: id, 'replies.replyId': replyId },
        {
          $set: {
            'replies.$.content': data.content,
            'replies.$.contentHtml': data.contentHtml,
            'replies.$.updatedAt': new Date(),
          },
        },
        { new: true },
      )
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Хариулт устгах */
  async removeReply(id: string, replyId: string): Promise<DiscussionPostEntity | null> {
    const doc = await this.postModel
      .findByIdAndUpdate(id, { $pull: { replies: { replyId } } }, { new: true })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Хариулт зөвшөөрөх (accept answer) */
  async acceptAnswer(id: string, replyId: string): Promise<DiscussionPostEntity | null> {
    /** Эхлээд хуучин accepted-г арилгана */
    await this.postModel
      .findOneAndUpdate(
        { _id: id, 'replies.isAccepted': true },
        { $set: { 'replies.$.isAccepted': false } },
      )
      .exec();

    /** Шинэ reply-г accepted болгоно */
    const doc = await this.postModel
      .findOneAndUpdate(
        { _id: id, 'replies.replyId': replyId },
        {
          $set: {
            'replies.$.isAccepted': true,
            acceptedAnswerId: replyId,
            isAnswered: true,
          },
        },
        { new: true },
      )
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Accepted answer цуцлах (хариулт устгагдсан тохиолдолд) */
  async clearAcceptedAnswer(id: string): Promise<DiscussionPostEntity | null> {
    const doc = await this.postModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            acceptedAnswerId: null,
            isAnswered: false,
          },
        },
        { new: true },
      )
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Pin toggle */
  async togglePin(id: string, isPinned: boolean): Promise<DiscussionPostEntity | null> {
    const doc = await this.postModel
      .findByIdAndUpdate(id, { $set: { isPinned } }, { new: true })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Lock toggle */
  async toggleLock(id: string, isLocked: boolean): Promise<DiscussionPostEntity | null> {
    const doc = await this.postModel
      .findByIdAndUpdate(id, { $set: { isLocked } }, { new: true })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Flag toggle */
  async toggleFlag(
    id: string,
    isFlagged: boolean,
    flagReason?: string,
  ): Promise<DiscussionPostEntity | null> {
    const doc = await this.postModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            isFlagged,
            flagReason: isFlagged ? flagReason : null,
          },
        },
        { new: true },
      )
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Тэмдэглэгдсэн (flagged) нийтлэлүүдийн жагсаалт (Admin moderation) */
  async findFlagged(
    page: number,
    limit: number,
    courseId?: string,
  ): Promise<{
    data: DiscussionPostEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const filter: FilterQuery<DiscussionPostDocument> = { isFlagged: true };

    if (courseId) {
      filter.courseId = courseId;
    }

    const [docs, total] = await Promise.all([
      this.postModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    return {
      data: docs.map((doc) => this.toEntity(doc)),
      total,
      page,
      limit,
    };
  }

  /** Тэмдэглэгдсэн нийтлэлийн тоо */
  async countFlagged(): Promise<number> {
    return this.postModel.countDocuments({ isFlagged: true }).exec();
  }

  /** Түгжигдсэн нийтлэлийн тоо */
  async countLocked(): Promise<number> {
    return this.postModel.countDocuments({ isLocked: true }).exec();
  }

  /** MongoDB document-г entity рүү хөрвүүлэх */
  private toEntity(doc: DiscussionPostDocument): DiscussionPostEntity {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plain: Record<string, any> = doc.toObject();

    const replies = (plain.replies ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: Record<string, any>) =>
        new ReplyVO({
          replyId: r.replyId,
          authorId: r.authorId,
          content: r.content,
          contentHtml: r.contentHtml,
          upvotes: r.upvotes ?? 0,
          downvotes: r.downvotes ?? 0,
          isAccepted: r.isAccepted ?? false,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }),
    );

    const voters = (plain.voters ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: Record<string, any>) =>
        new VoterVO({
          userId: v.userId,
          voteType: v.voteType,
        }),
    );

    return new DiscussionPostEntity({
      id: plain._id.toString(),
      courseId: plain.courseId,
      lessonId: plain.lessonId,
      threadId: plain.threadId,
      authorId: plain.authorId,
      postType: plain.postType,
      title: plain.title,
      content: plain.content,
      contentHtml: plain.contentHtml,
      isAnswered: plain.isAnswered ?? false,
      acceptedAnswerId: plain.acceptedAnswerId,
      upvotes: plain.upvotes ?? 0,
      downvotes: plain.downvotes ?? 0,
      voteScore: plain.voteScore ?? 0,
      replies,
      voters,
      tags: plain.tags ?? [],
      viewsCount: plain.viewsCount ?? 0,
      isPinned: plain.isPinned ?? false,
      isLocked: plain.isLocked ?? false,
      isFlagged: plain.isFlagged ?? false,
      flagReason: plain.flagReason,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    });
  }
}
