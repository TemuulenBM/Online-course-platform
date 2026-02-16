import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * Хичээлүүдийн жагсаалтын query DTO.
 * courseId нь URL param-аас ирнэ, query-д зөвхөн шүүлтүүр.
 * Pagination шаардлагагүй — нэг сургалтад 10-100 хичээл байна.
 */
export class ListLessonsQueryDto {
  @ApiProperty({
    description: 'Зөвхөн нийтлэгдсэн хичээлүүд',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'publishedOnly утга boolean байх ёстой' })
  publishedOnly?: boolean;
}
