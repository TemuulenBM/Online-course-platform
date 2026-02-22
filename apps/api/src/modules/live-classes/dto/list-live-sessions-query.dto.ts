import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/** Live session жагсаалтын query DTO */
export class ListLiveSessionsQueryDto {
  /** Хуудасны дугаар */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /** Хуудасны хэмжээ */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  /** Статус шүүлтүүр (scheduled, live, ended, cancelled) */
  @IsOptional()
  @IsString()
  status?: string;

  /** Цаг шүүлтүүр (upcoming | past | all) */
  @IsOptional()
  @IsString()
  timeFilter?: string;
}
