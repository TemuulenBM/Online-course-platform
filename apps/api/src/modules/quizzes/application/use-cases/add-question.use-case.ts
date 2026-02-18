import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizQuestionsRepository } from '../../infrastructure/repositories/quiz-questions.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { AddQuestionDto } from '../../dto/add-question.dto';
import { QuizQuestionsDocument } from '../../infrastructure/schemas/quiz-questions.schema';

/**
 * Асуулт нэмэх use case.
 * Quiz-д шинэ асуулт нэмэх бизнес логик.
 * Зөвхөн quiz-ийн эзэмшигч (instructor) эсвэл ADMIN нэмэх эрхтэй.
 */
@Injectable()
export class AddQuestionUseCase {
  private readonly logger = new Logger(AddQuestionUseCase.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
    private readonly quizCacheService: QuizCacheService,
  ) {}

  /**
   * Асуулт нэмэх үйлдлийг гүйцэтгэх.
   * @param quizId - Quiz ID
   * @param userId - Хэрэглэгчийн ID
   * @param userRole - Хэрэглэгчийн эрх
   * @param dto - Асуултын мэдээлэл
   * @returns Шинэчлэгдсэн quiz questions document
   */
  async execute(
    quizId: string,
    userId: string,
    userRole: string,
    dto: AddQuestionDto,
  ): Promise<QuizQuestionsDocument> {
    /** 1. Quiz олдох эсэх шалгах */
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz олдсонгүй');
    }

    /** 2. Эрхийн шалгалт — эзэмшигч эсвэл ADMIN */
    if (quiz.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ quiz-д асуулт нэмэх эрхгүй байна');
    }

    /** 3. Асуултын төрлөөс хамаарсан validation */
    this.validateQuestionType(dto);

    /** 4. Одоогийн асуултуудыг авч orderIndex тодорхойлох */
    const currentDoc = await this.quizQuestionsRepository.findByQuizId(quizId);
    let maxOrderIndex = -1;
    if (currentDoc && currentDoc.questions.length > 0) {
      maxOrderIndex = Math.max(...currentDoc.questions.map((q) => q.orderIndex));
    }
    const orderIndex = maxOrderIndex + 1;

    /** 5. Асуулт объект бүтээх */
    const question = this.buildQuestionObject(dto, orderIndex);

    /** 6. MongoDB-д хадгалах */
    const updatedDoc = await this.quizQuestionsRepository.addQuestion(quizId, question);
    if (!updatedDoc) {
      throw new NotFoundException('Quiz questions document олдсонгүй');
    }

    /** 7. Кэш invalidate */
    await this.quizCacheService.invalidateAll(quizId, quiz.lessonId);

    this.logger.log(
      `Асуулт нэмэгдлээ: quizId=${quizId}, questionId=${question.questionId}, type=${dto.type}`,
    );

    return updatedDoc;
  }

  /**
   * Асуултын төрлөөс хамаарсан validation.
   * Төрөл бүрт тохирох field-ууд заавал байх ёстой.
   */
  private validateQuestionType(dto: AddQuestionDto): void {
    switch (dto.type) {
      case 'multiple_choice':
        if (!dto.options || dto.options.length < 2) {
          throw new BadRequestException('Олон сонголттой асуулт дор хаяж 2 сонголттой байх ёстой');
        }
        const correctCount = dto.options.filter((o) => o.isCorrect).length;
        if (correctCount !== 1) {
          throw new BadRequestException('Олон сонголттой асуулт яг нэг зөв хариулттай байх ёстой');
        }
        break;

      case 'true_false':
        if (dto.correctAnswer === undefined || dto.correctAnswer === null) {
          throw new BadRequestException('Үнэн/Худал асуулт correctAnswer утгатай байх ёстой');
        }
        break;

      case 'fill_blank':
        if (!dto.correctAnswers || dto.correctAnswers.length < 1) {
          throw new BadRequestException('Нөхөх асуулт дор хаяж 1 зөв хариулттай байх ёстой');
        }
        break;

      case 'code_challenge':
        if (!dto.language) {
          throw new BadRequestException('Код бичих асуулт програмчлалын хэлтэй байх ёстой');
        }
        if (!dto.starterCode) {
          throw new BadRequestException('Код бичих асуулт эхлэх кодтой байх ёстой');
        }
        if (!dto.testCases || dto.testCases.length < 1) {
          throw new BadRequestException('Код бичих асуулт дор хаяж 1 тест тохиолдолтой байх ёстой');
        }
        break;

      case 'essay':
        /** Essay төрөлд нэмэлт validation шаардлагагүй */
        break;
    }
  }

  /**
   * DTO-ээс асуулт объект бүтээх.
   * Бүх төрөлд хамаарах нийтлэг field-ууд болон төрлөөс хамаарах field-ууд.
   */
  private buildQuestionObject(dto: AddQuestionDto, orderIndex: number): Record<string, any> {
    const question: Record<string, any> = {
      questionId: uuidv4(),
      type: dto.type,
      questionText: dto.questionText,
      points: dto.points,
      orderIndex,
    };

    /** Нийтлэг optional field-ууд */
    if (dto.explanation !== undefined) question.explanation = dto.explanation;
    if (dto.difficulty !== undefined) question.difficulty = dto.difficulty;
    if (dto.tags !== undefined) question.tags = dto.tags;

    /** Төрлөөс хамаарах field-ууд */
    switch (dto.type) {
      case 'multiple_choice':
        question.options = dto.options;
        break;

      case 'true_false':
        question.correctAnswer = dto.correctAnswer;
        break;

      case 'fill_blank':
        question.correctAnswers = dto.correctAnswers;
        if (dto.caseSensitive !== undefined) question.caseSensitive = dto.caseSensitive;
        break;

      case 'code_challenge':
        question.language = dto.language;
        question.starterCode = dto.starterCode;
        question.testCases = dto.testCases;
        if (dto.solution !== undefined) question.solution = dto.solution;
        break;

      case 'essay':
        if (dto.minWords !== undefined) question.minWords = dto.minWords;
        if (dto.maxWords !== undefined) question.maxWords = dto.maxWords;
        if (dto.rubric !== undefined) question.rubric = dto.rubric;
        break;
    }

    return question;
  }
}
