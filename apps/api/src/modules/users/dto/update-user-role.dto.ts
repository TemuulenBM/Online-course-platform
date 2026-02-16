import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/**
 * Хэрэглэгчийн эрх өөрчлөх хүсэлтийн DTO.
 * Зөвхөн ADMIN эрхтэй хэрэглэгч ашиглана.
 */
export class UpdateUserRoleDto {
  @ApiProperty({ description: 'Шинэ эрх', enum: Role, example: 'TEACHER' })
  @IsEnum(Role, { message: 'Эрх нь STUDENT, TEACHER, ADMIN-ын аль нэг байх ёстой' })
  role!: Role;
}
