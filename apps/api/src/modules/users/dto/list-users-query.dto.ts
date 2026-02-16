import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

/**
 * Хэрэглэгчдийн жагсаалтын query DTO.
 * Pagination болон role filter дэмжинэ.
 */
export class ListUsersQueryDto {
  @ApiProperty({ description: 'Хуудасны дугаар', example: 1, required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хуудасны дугаар бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Хуудасны дугаар хамгийн багадаа 1 байна' })
  page?: number = 1;

  @ApiProperty({ description: 'Хуудас бүрийн тоо', example: 20, required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Хуудас бүрийн тоо бүхэл тоо байх ёстой' })
  @Min(1, { message: 'Хуудас бүрийн тоо хамгийн багадаа 1 байна' })
  @Max(100, { message: 'Хуудас бүрийн тоо хамгийн ихдээ 100 байна' })
  limit?: number = 20;

  @ApiProperty({ description: 'Эрхээр шүүх', enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role, { message: 'Эрх нь STUDENT, TEACHER, ADMIN-ын аль нэг байх ёстой' })
  role?: Role;
}
