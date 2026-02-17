import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * Сургалтад элсэх хүсэлтийн DTO.
 */
export class EnrollDto {
  @ApiProperty({ description: 'Элсэх сургалтын ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4', { message: 'Сургалтын ID UUID формат байх ёстой' })
  courseId!: string;
}
