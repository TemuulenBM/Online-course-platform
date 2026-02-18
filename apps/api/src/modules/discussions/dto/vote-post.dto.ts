import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Нийтлэлд санал өгөх хүсэлтийн DTO.
 * Хэрэглэгч нийтлэл эсвэл хариултыг дэмжих/эсэргүүцэхэд ашиглана.
 */
export class VotePostDto {
  @ApiProperty({
    description: 'Саналын төрөл',
    enum: ['up', 'down'],
    example: 'up',
  })
  @IsEnum(['up', 'down'], {
    message: 'Саналын төрөл up эсвэл down байх ёстой',
  })
  voteType!: string;
}
