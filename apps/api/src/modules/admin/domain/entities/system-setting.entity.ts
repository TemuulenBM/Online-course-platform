/**
 * Системийн тохиргоо домэйн entity.
 * PostgreSQL-ийн SystemSetting моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class SystemSettingEntity {
  readonly id: string;
  readonly key: string;
  readonly value: unknown;
  readonly description: string | null;
  readonly category: string;
  readonly isPublic: boolean;
  readonly updatedBy: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    key: string;
    value: unknown;
    description: string | null;
    category: string;
    isPublic: boolean;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.key = props.key;
    this.value = props.value;
    this.description = props.description;
    this.category = props.category;
    this.isPublic = props.isPublic;
    this.updatedBy = props.updatedBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Тохиргооны мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      key: this.key,
      value: this.value,
      description: this.description,
      category: this.category,
      isPublic: this.isPublic,
      updatedAt: this.updatedAt,
    };
  }
}
