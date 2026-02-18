import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizQuestionsRepository } from '../../infrastructure/repositories/quiz-questions.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { QuizEntity } from '../../domain/entities/quiz.entity';
import { CreateQuizDto } from '../../dto/create-quiz.dto';

/**
 * Quiz үүсгэх use case.
 * Хичээлийн төрөл, давхардал, эзэмшигчийн эрх зэргийг шалгаж quiz үүсгэнэ.
 * PostgreSQL-д quiz metadata, MongoDB-д хоосон асуултуудын document үүсгэнэ.
 */
@Injectable()
export class CreateQuizUseCase {
  private readonly logger = new Logger(CreateQuizUseCase.name);

  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly quizRepository: QuizRepository,
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
    private readonly quizCacheService: QuizCacheService,
  ) {}

  /**
   * Quiz үүсгэх.
   * @param userId - Одоогийн хэрэглэгчийн ID
   * @param userRole - Одоогийн хэрэглэгчийн эрх (TEACHER, ADMIN гэх мэт)
   * @param dto - Quiz үүсгэх мэдээлэл
   * @returns Үүсгэсэн QuizEntity
   */
  async execute(userId: string, userRole: string, dto: CreateQuizDto): Promise<QuizEntity> {
    /** 1. Хичээл олдох эсэх шалгах */
    const lesson = await this.lessonRepository.findById(dto.lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    /** 2. Хичээлийн төрөл QUIZ эсэх шалгах */
    if (lesson.lessonType !== 'quiz') {
      throw new BadRequestException('Энэ хичээлийн төрөл QUIZ биш байна');
    }

    /** 3. Эзэмшигчийн эрх шалгах */
    if (lesson.courseInstructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ хичээлд quiz үүсгэх эрхгүй');
    }

    /** 4. Давхардал шалгах — нэг хичээлд нэг quiz */
    const existingQuiz = await this.quizRepository.findByLessonId(dto.lessonId);
    if (existingQuiz) {
      throw new ConflictException('Энэ хичээлд quiz аль хэдийн үүсгэсэн байна');
    }

    /** 5. PostgreSQL-д quiz үүсгэх */
    const quiz = await this.quizRepository.create({
      lessonId: dto.lessonId,
      title: dto.title,
      description: dto.description,
      timeLimitMinutes: dto.timeLimitMinutes,
      passingScorePercentage: dto.passingScorePercentage,
      randomizeQuestions: dto.randomizeQuestions,
      randomizeOptions: dto.randomizeOptions,
      maxAttempts: dto.maxAttempts,
    });

    /** 6. MongoDB-д хоосон асуултуудын document үүсгэх */
    await this.quizQuestionsRepository.create(quiz.id);

    this.logger.log(`Quiz үүсгэгдлээ: ${quiz.id} — хичээл: ${dto.lessonId}, хэрэглэгч: ${userId}`);
    return quiz;
  }
}
