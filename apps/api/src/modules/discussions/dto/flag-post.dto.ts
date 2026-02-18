import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Нийтлэл тэмдэглэх (flag) хүсэлтийн DTO.
 * Зохисгүй агуулгыг мэдэгдэхэд ашиглана.
 */
export class FlagPostDto {
  @ApiProperty({
    description: 'Тэмдэглэсэн эсэх',
    example: true,
  })
  @IsBoolean({ message: 'Тэмдэглэсэн эсэх boolean утга байх ёстой' })
  isFlagged!: boolean;

  @ApiProperty({
    description: 'Тэмдэглэсэн шалтгаан',
    example: 'Зохисгүй агуулга',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Шалтгаан тэмдэгт мөр байх ёстой' })
  @MaxLength(500, { message: 'Шалтгаан хамгийн ихдээ 500 тэмдэгт байна' })
  flagReason?: string;
}
