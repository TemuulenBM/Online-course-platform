import { Role } from '@prisma/client';

/**
 * Хэрэглэгчийн домэйн entity.
 * Мэдээллийн сангийн User моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class UserEntity {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: Role;
  readonly emailVerified: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastLoginAt: Date | null;

  constructor(props: {
    id: string;
    email: string;
    passwordHash: string;
    role: Role;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.emailVerified = props.emailVerified;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.lastLoginAt = props.lastLoginAt;
  }

  /** Нууц үгийн хэшгүйгээр хэрэглэгчийн мэдээлэл буцаана */
  toResponse() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLoginAt: this.lastLoginAt,
    };
  }
}
