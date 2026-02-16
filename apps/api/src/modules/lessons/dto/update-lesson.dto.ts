import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateLessonDto } from './create-lesson.dto';

/**
 * Хичээл шинэчлэх хүсэлтийн DTO.
 * courseId-г өөрчлөх боломжгүй — хичээлийг сургалт хооронд зөөхгүй.
 */
export class UpdateLessonDto extends PartialType(
  OmitType(CreateLessonDto, ['courseId'] as const),
) {}
