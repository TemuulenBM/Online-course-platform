/**
 * Хавсралт файлын value object.
 * Файлын нэр, URL, хэмжээ, MIME төрөл зэрэг мэдээллийг агуулна.
 */
export class AttachmentVO {
  readonly filename: string;
  readonly url: string;
  readonly sizeBytes: number;
  readonly mimeType: string;

  constructor(props: { filename: string; url: string; sizeBytes?: number; mimeType?: string }) {
    this.filename = props.filename;
    this.url = props.url;
    this.sizeBytes = props.sizeBytes ?? 0;
    this.mimeType = props.mimeType ?? '';
  }

  /** Response хэлбэрээр буцаана */
  toResponse() {
    return {
      filename: this.filename,
      url: this.url,
      sizeBytes: this.sizeBytes,
      mimeType: this.mimeType,
    };
  }
}
