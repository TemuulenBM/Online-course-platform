/**
 * Видео контентын value object.
 * Видео хичээлийн URL, thumbnail, үргэлжлэх хугацаа,
 * транскод хувилбарууд, хадмал зэрэг мэдээллийг агуулна.
 */
export class VideoContentVO {
  readonly videoUrl: string;
  readonly thumbnailUrl: string;
  readonly durationSeconds: number;
  readonly transcodedVersions: {
    quality: string;
    url: string;
    bitrate: string;
  }[];
  readonly subtitles: { language: string; url: string }[];

  constructor(props: {
    videoUrl?: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    transcodedVersions?: { quality: string; url: string; bitrate: string }[];
    subtitles?: { language: string; url: string }[];
  }) {
    this.videoUrl = props.videoUrl ?? '';
    this.thumbnailUrl = props.thumbnailUrl ?? '';
    this.durationSeconds = props.durationSeconds ?? 0;
    this.transcodedVersions = props.transcodedVersions ?? [];
    this.subtitles = props.subtitles ?? [];
  }

  /** Response хэлбэрээр буцаана */
  toResponse() {
    return {
      videoUrl: this.videoUrl,
      thumbnailUrl: this.thumbnailUrl,
      durationSeconds: this.durationSeconds,
      transcodedVersions: this.transcodedVersions,
      subtitles: this.subtitles,
    };
  }
}
