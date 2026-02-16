import { ApiProperty } from '@nestjs/swagger';

/**
 * Хэрэглэгчийн мэдээллийн хариу DTO.
 * Нууц үгийн хэшгүйгээр хэрэглэгчийн мэдээллийг буцаана.
 */
export class UserResponseDto {
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

  @ApiProperty({ description: 'Шинэчлэгдсэн огноо' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Сүүлд нэвтэрсэн огноо', nullable: true })
  lastLoginAt!: Date | null;
}

/**
 * Баталгаажуулалтын хариу DTO.
 * Access token, refresh token болон хэрэглэгчийн мэдээллийг буцаана.
 */
export class AuthResponseDto {
  @ApiProperty({ description: 'Access токен' })
  accessToken!: string;

  @ApiProperty({ description: 'Refresh токен' })
  refreshToken!: string;

  @ApiProperty({ description: 'Хэрэглэгчийн мэдээлэл', type: UserResponseDto })
  user!: UserResponseDto;
}
