/**
 * Текст контентын value object.
 * HTML, markdown хэлбэрийн текст контент болон уншихад
 * зарцуулагдах хугацааг агуулна.
 */
export class TextContentVO {
  readonly html: string;
  readonly markdown: string;
  readonly readingTimeMinutes: number;

  constructor(props: {
    html?: string;
    markdown?: string;
    readingTimeMinutes?: number;
  }) {
    this.html = props.html ?? '';
    this.markdown = props.markdown ?? '';
    this.readingTimeMinutes = props.readingTimeMinutes ?? 0;
  }

  /** Response хэлбэрээр буцаана */
  toResponse() {
    return {
      html: this.html,
      markdown: this.markdown,
      readingTimeMinutes: this.readingTimeMinutes,
    };
  }
}
