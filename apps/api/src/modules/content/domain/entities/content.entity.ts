import { VideoContentVO } from '../value-objects/video-content.vo';
import { TextContentVO } from '../value-objects/text-content.vo';
import { AttachmentVO } from '../value-objects/attachment.vo';

/**
 * Хичээлийн контент домэйн entity.
 * MongoDB-ийн course_content collection-ийг бизнес логикийн түвшинд төлөөлнө.
 * Нэг хичээлд нэг контент document байна.
 */
export class ContentEntity {
  readonly id: string;
  readonly lessonId: string;
  readonly contentType: string;
  readonly videoContent?: VideoContentVO;
  readonly textContent?: TextContentVO;
  readonly attachments: AttachmentVO[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    lessonId: string;
    contentType: string;
    videoContent?: VideoContentVO;
    textContent?: TextContentVO;
    attachments?: AttachmentVO[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.lessonId = props.lessonId;
    this.contentType = props.contentType;
    this.videoContent = props.videoContent;
    this.textContent = props.textContent;
    this.attachments = props.attachments ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Контентын мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      lessonId: this.lessonId,
      contentType: this.contentType,
      videoContent: this.videoContent?.toResponse() ?? null,
      textContent: this.textContent?.toResponse() ?? null,
      attachments: this.attachments.map((a) => a.toResponse()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
