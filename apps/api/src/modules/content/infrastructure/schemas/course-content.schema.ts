import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** Транскод хийгдсэн видеоны хувилбар */
export class TranscodedVersion {
  @Prop({ required: true })
  quality!: string;

  @Prop({ required: true })
  url!: string;

  @Prop()
  bitrate!: string;
}

/** Хадмал орчуулга */
export class Subtitle {
  @Prop({ required: true })
  language!: string;

  @Prop({ required: true })
  url!: string;
}

/** Видео контент */
export class VideoContent {
  @Prop()
  videoUrl!: string;

  @Prop()
  thumbnailUrl!: string;

  @Prop({ default: 0 })
  durationSeconds!: number;

  @Prop({ type: [TranscodedVersion], default: [] })
  transcodedVersions!: TranscodedVersion[];

  @Prop({ type: [Subtitle], default: [] })
  subtitles!: Subtitle[];
}

/** Текст контент */
export class TextContent {
  @Prop()
  html!: string;

  @Prop()
  markdown!: string;

  @Prop({ default: 0 })
  readingTimeMinutes!: number;
}

/** Хавсралт файл */
export class Attachment {
  @Prop({ required: true })
  filename!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ default: 0 })
  sizeBytes!: number;

  @Prop()
  mimeType!: string;
}

/**
 * Хичээлийн контент schema.
 * MongoDB-ийн course_content collection-д хадгалагдана.
 * Нэг хичээлд нэг document — lessonId unique index-тэй.
 */
@Schema({
  collection: 'course_content',
  timestamps: true,
})
export class CourseContent {
  @Prop({ required: true, unique: true, index: true })
  lessonId!: string;

  @Prop({
    required: true,
    enum: ['video', 'text', 'quiz', 'assignment', 'live'],
  })
  contentType!: string;

  @Prop({ type: VideoContent })
  videoContent?: VideoContent;

  @Prop({ type: TextContent })
  textContent?: TextContent;

  @Prop({ type: [Attachment], default: [] })
  attachments!: Attachment[];
}

export type CourseContentDocument = HydratedDocument<CourseContent>;
export const CourseContentSchema = SchemaFactory.createForClass(CourseContent);
