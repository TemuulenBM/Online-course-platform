/**
 * Хэрэглэгчийн профайлын домэйн entity.
 * Мэдээллийн сангийн UserProfile моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class UserProfileEntity {
  readonly id: string;
  readonly userId: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly avatarUrl: string | null;
  readonly bio: string | null;
  readonly country: string | null;
  readonly timezone: string | null;
  readonly preferences: Record<string, unknown> | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    country: string | null;
    timezone: string | null;
    preferences: unknown;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.avatarUrl = props.avatarUrl;
    this.bio = props.bio;
    this.country = props.country;
    this.timezone = props.timezone;
    this.preferences = props.preferences as Record<string, unknown> | null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Профайлын мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      avatarUrl: this.avatarUrl,
      bio: this.bio,
      country: this.country,
      timezone: this.timezone,
      preferences: this.preferences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
