import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Сэтгэгдэл шинэчлэх хүсэлтийн DTO.
 * Хичээлийн сэтгэгдлийн агуулгыг засварлахад ашиглана.
 */
export class UpdateCommentDto {
  @ApiProperty({
    description: 'Сэтгэгдлийн агуулга',
    example: 'Энэ хэсгийг илүү дэлгэрэнгүй тайлбарлана уу',
  })
  @IsString({ message: 'Агуулга тэмдэгт мөр байх ёстой' })
  @MinLength(1, { message: 'Агуулга хоосон байж болохгүй' })
  content!: string;
}
