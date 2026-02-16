/**
 * Сургалтын домэйн entity.
 * PostgreSQL-ийн Course моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class CourseEntity {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly description: string;
  readonly instructorId: string;
  readonly categoryId: string;
  readonly price: number | null;
  readonly discountPrice: number | null;
  readonly difficulty: string;
  readonly language: string;
  readonly status: string;
  readonly thumbnailUrl: string | null;
  readonly durationMinutes: number;
  readonly publishedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly tags?: string[];
  readonly instructorName?: string;
  readonly categoryName?: string;

  constructor(props: {
    id: string;
    title: string;
    slug: string;
    description: string;
    instructorId: string;
    categoryId: string;
    price: unknown;
    discountPrice: unknown;
    difficulty: string;
    language: string;
    status: string;
    thumbnailUrl: string | null;
    durationMinutes: number;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    instructorName?: string;
    categoryName?: string;
  }) {
    this.id = props.id;
    this.title = props.title;
    this.slug = props.slug;
    this.description = props.description;
    this.instructorId = props.instructorId;
    this.categoryId = props.categoryId;
    this.price = props.price != null ? Number(props.price) : null;
    this.discountPrice = props.discountPrice != null ? Number(props.discountPrice) : null;
    this.difficulty = props.difficulty;
    this.language = props.language;
    this.status = props.status;
    this.thumbnailUrl = props.thumbnailUrl;
    this.durationMinutes = props.durationMinutes;
    this.publishedAt = props.publishedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.tags = props.tags;
    this.instructorName = props.instructorName;
    this.categoryName = props.categoryName;
  }

  /** Сургалтын мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      description: this.description,
      instructorId: this.instructorId,
      categoryId: this.categoryId,
      price: this.price,
      discountPrice: this.discountPrice,
      difficulty: this.difficulty,
      language: this.language,
      status: this.status,
      thumbnailUrl: this.thumbnailUrl,
      durationMinutes: this.durationMinutes,
      publishedAt: this.publishedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      instructorName: this.instructorName,
      categoryName: this.categoryName,
    };
  }
}
