import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseContent,
  CourseContentDocument,
} from '../schemas/course-content.schema';
import { ContentEntity } from '../../domain/entities/content.entity';
import { VideoContentVO } from '../../domain/value-objects/video-content.vo';
import { TextContentVO } from '../../domain/value-objects/text-content.vo';
import { AttachmentVO } from '../../domain/value-objects/attachment.vo';

/**
 * Контент repository.
 * MongoDB-ийн course_content collection-тэй харьцах CRUD үйлдлүүд.
 */
@Injectable()
export class ContentRepository {
  private readonly logger = new Logger(ContentRepository.name);

  constructor(
    @InjectModel(CourseContent.name)
    private readonly contentModel: Model<CourseContentDocument>,
  ) {}

  /** Контент үүсгэх */
  async create(data: {
    lessonId: string;
    contentType: string;
    videoContent?: {
      videoUrl?: string;
      thumbnailUrl?: string;
      durationSeconds?: number;
      transcodedVersions?: { quality: string; url: string; bitrate: string }[];
      subtitles?: { language: string; url: string }[];
    };
    textContent?: {
      html?: string;
      markdown?: string;
      readingTimeMinutes?: number;
    };
    attachments?: {
      filename: string;
      url: string;
      sizeBytes?: number;
      mimeType?: string;
    }[];
  }): Promise<ContentEntity> {
    const doc = await this.contentModel.create(data);
    this.logger.debug(`Контент үүсгэгдлээ: lessonId=${data.lessonId}`);
    return this.toEntity(doc);
  }

  /** lessonId-аар контент хайх */
  async findByLessonId(lessonId: string): Promise<ContentEntity | null> {
    const doc = await this.contentModel.findOne({ lessonId }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Контент шинэчлэх (lessonId-аар) */
  async updateByLessonId(
    lessonId: string,
    data: Partial<{
      contentType: string;
      videoContent: {
        videoUrl?: string;
        thumbnailUrl?: string;
        durationSeconds?: number;
        transcodedVersions?: {
          quality: string;
          url: string;
          bitrate: string;
        }[];
        subtitles?: { language: string; url: string }[];
      };
      textContent: {
        html?: string;
        markdown?: string;
        readingTimeMinutes?: number;
      };
      attachments: {
        filename: string;
        url: string;
        sizeBytes?: number;
        mimeType?: string;
      }[];
    }>,
  ): Promise<ContentEntity | null> {
    const doc = await this.contentModel
      .findOneAndUpdate({ lessonId }, { $set: data }, { new: true })
      .exec();
    if (doc) {
      this.logger.debug(`Контент шинэчлэгдлээ: lessonId=${lessonId}`);
    }
    return doc ? this.toEntity(doc) : null;
  }

  /** Контент устгах */
  async deleteByLessonId(lessonId: string): Promise<void> {
    await this.contentModel.deleteOne({ lessonId }).exec();
    this.logger.debug(`Контент устгагдлаа: lessonId=${lessonId}`);
  }

  /** Хавсралт нэмэх */
  async addAttachment(
    lessonId: string,
    attachment: {
      filename: string;
      url: string;
      sizeBytes: number;
      mimeType: string;
    },
  ): Promise<ContentEntity | null> {
    const doc = await this.contentModel
      .findOneAndUpdate(
        { lessonId },
        { $push: { attachments: attachment } },
        { new: true },
      )
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** Хавсралт устгах (filename-аар) */
  async removeAttachment(
    lessonId: string,
    filename: string,
  ): Promise<ContentEntity | null> {
    const doc = await this.contentModel
      .findOneAndUpdate(
        { lessonId },
        { $pull: { attachments: { filename } } },
        { new: true },
      )
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /** MongoDB document-г ContentEntity болгож хөрвүүлнэ */
  private toEntity(doc: CourseContentDocument): ContentEntity {
    const plain = doc.toObject() as any;

    let videoContent: VideoContentVO | undefined;
    if (plain.videoContent) {
      videoContent = new VideoContentVO({
        videoUrl: plain.videoContent.videoUrl,
        thumbnailUrl: plain.videoContent.thumbnailUrl,
        durationSeconds: plain.videoContent.durationSeconds,
        transcodedVersions: plain.videoContent.transcodedVersions ?? [],
        subtitles: plain.videoContent.subtitles ?? [],
      });
    }

    let textContent: TextContentVO | undefined;
    if (plain.textContent) {
      textContent = new TextContentVO({
        html: plain.textContent.html,
        markdown: plain.textContent.markdown,
        readingTimeMinutes: plain.textContent.readingTimeMinutes,
      });
    }

    const attachments = (plain.attachments ?? []).map(
      (a: any) =>
        new AttachmentVO({
          filename: a.filename,
          url: a.url,
          sizeBytes: a.sizeBytes,
          mimeType: a.mimeType,
        }),
    );

    return new ContentEntity({
      id: plain._id.toString(),
      lessonId: plain.lessonId,
      contentType: plain.contentType,
      videoContent,
      textContent,
      attachments,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    });
  }
}
