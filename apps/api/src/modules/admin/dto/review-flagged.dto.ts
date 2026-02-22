import { IsEnum, IsOptional, IsString } from 'class-validator';

/** Тэмдэглэгдсэн контент хянах DTO */
export class ReviewFlaggedDto {
  @IsEnum(['approve', 'reject'], { message: 'Үйлдэл approve эсвэл reject байх ёстой' })
  action!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  reason?: string;
}
