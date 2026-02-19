import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Бүртгэл үүсгэх DTO */
export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Төлөвлөгөөний төрөл',
    enum: ['monthly', 'yearly'],
  })
  @IsIn(['monthly', 'yearly'])
  planType!: string;
}
