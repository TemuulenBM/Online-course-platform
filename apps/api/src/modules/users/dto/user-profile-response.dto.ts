import { ApiProperty } from '@nestjs/swagger';

/**
 * Профайлын хариултын DTO.
 * Swagger документацад ашиглагдана.
 */
export class UserProfileResponseDto {
  @ApiProperty({ description: 'Профайлын ID' })
  id!: string;

  @ApiProperty({ description: 'Хэрэглэгчийн ID' })
  userId!: string;

  @ApiProperty({ description: 'Нэр', nullable: true })
  firstName!: string | null;

  @ApiProperty({ description: 'Овог', nullable: true })
  lastName!: string | null;

  @ApiProperty({ description: 'Профайл зургийн URL', nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ description: 'Намтар', nullable: true })
  bio!: string | null;

  @ApiProperty({ description: 'Улс', nullable: true })
  country!: string | null;

  @ApiProperty({ description: 'Цагийн бүс', nullable: true })
  timezone!: string | null;

  @ApiProperty({ description: 'Хэрэглэгчийн сонголтууд', nullable: true })
  preferences!: Record<string, unknown> | null;

  @ApiProperty({ description: 'Үүссэн огноо' })
  createdAt!: Date;

  @ApiProperty({ description: 'Шинэчлэгдсэн огноо' })
  updatedAt!: Date;
}

/**
 * Хэрэглэгчийн бүрэн мэдээлэл (User + Profile).
 */
export class UserWithProfileResponseDto {
  @ApiProperty({ description: 'Хэрэглэгчийн ID' })
  id!: string;

  @ApiProperty({ description: 'Имэйл хаяг' })
  email!: string;

  @ApiProperty({ description: 'Хэрэглэгчийн эрх', enum: ['STUDENT', 'TEACHER', 'ADMIN'] })
  role!: string;

  @ApiProperty({ description: 'Имэйл баталгаажсан эсэх' })
  emailVerified!: boolean;

  @ApiProperty({ description: 'Бүртгүүлсэн огноо' })
  createdAt!: Date;

  @ApiProperty({ description: 'Профайлын мэдээлэл', nullable: true, type: UserProfileResponseDto })
  profile!: UserProfileResponseDto | null;
}
