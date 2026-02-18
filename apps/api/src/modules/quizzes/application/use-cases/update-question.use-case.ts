import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizQuestionsRepository } from '../../infrastructure/repositories/quiz-questions.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { UpdateQuestionDto } from '../../dto/update-question.dto';
import { QuizQuestionsDocument } from '../../infrastructure/schemas/quiz-questions.schema';

/**
 * Асуулт шинэчлэх use case.
 * Quiz дотор байгаа тодорхой асуултыг шинэчлэх бизнес логик.
 * Зөвхөн quiz-ийн эзэмшигч (instructor) эсвэл ADMIN шинэчлэх эрхтэй.
 */
@Injectable()
export class UpdateQuestionUseCase {
  private readonly logger = new Logger(UpdateQuestionUseCase.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
    private readonly quizCacheService: QuizCacheService,
  ) {}

  /**
   * Асуулт шинэчлэх үйлдлийг гүйцэтгэх.
   * @param quizId - Quiz ID
   * @param questionId - Асуултын ID
   * @param userId - Хэрэглэгчийн ID
   * @param userRole - Хэрэглэгчийн эрх
   * @param dto - Шинэчлэх мэдээлэл
   * @returns Шинэчлэгдсэн quiz questions document
   */
  async execute(
    quizId: string,
    questionId: string,
    userId: string,
    userRole: string,
    dto: UpdateQuestionDto,
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

    /** 3. Questions document олдох эсэх шалгах */
    const questionsDoc = await this.quizQuestionsRepository.findByQuizId(quizId);
    if (!questionsDoc) {
      throw new NotFoundException('Асуултууд олдсонгүй');
    }

    /** 4. Тухайн асуулт массиваас хайх */
    const existingQuestion = questionsDoc.questions.find((q) => q.questionId === questionId);
    if (!existingQuestion) {
      throw new NotFoundException('Асуулт олдсонгүй');
    }

    /** 5. Шинэчлэх утгуудыг бэлтгэх — зөвхөн DTO-д байгаа field-ууд */
    const updateData = this.buildUpdateData(dto, existingQuestion);

    /** 6. Хэрэв төрөл өөрчлөгдөж байвал шинэ төрлийн validation хийх */
    const effectiveType = dto.type ?? existingQuestion.type;
    this.validateQuestionType(effectiveType, updateData, existingQuestion);

    /** 7. MongoDB-д шинэчлэх */
    const updatedDoc = await this.quizQuestionsRepository.updateQuestion(
      quizId,
      questionId,
      updateData,
    );
    if (!updatedDoc) {
      throw new NotFoundException('Асуулт шинэчлэхэд алдаа гарлаа');
    }

    /** 8. Кэш invalidate */
    await this.quizCacheService.invalidateAll(quizId, quiz.lessonId);

    this.logger.log(`Асуулт шинэчлэгдлээ: quizId=${quizId}, questionId=${questionId}`);

    return updatedDoc;
  }

  /**
   * DTO-ээс шинэчлэх утгуудыг бэлтгэх.
   * Зөвхөн undefined биш (тодорхойлсон) field-үүдийг оруулна.
   * Өөрчлөгдөөгүй field-ууд хуучин утгаа хадгална.
   */
  private buildUpdateData(
    dto: UpdateQuestionDto,
    existing: Record<string, any>,
  ): Record<string, any> {
    const data: Record<string, any> = {};

    /** Нийтлэг field-ууд */
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.questionText !== undefined) data.questionText = dto.questionText;
    if (dto.points !== undefined) data.points = dto.points;
    if (dto.explanation !== undefined) data.explanation = dto.explanation;
    if (dto.difficulty !== undefined) data.difficulty = dto.difficulty;
    if (dto.tags !== undefined) data.tags = dto.tags;

    /** multiple_choice field-ууд */
    if (dto.options !== undefined) data.options = dto.options;

    /** true_false field-ууд */
    if (dto.correctAnswer !== undefined) data.correctAnswer = dto.correctAnswer;

    /** fill_blank field-ууд */
    if (dto.correctAnswers !== undefined) data.correctAnswers = dto.correctAnswers;
    if (dto.caseSensitive !== undefined) data.caseSensitive = dto.caseSensitive;

    /** code_challenge field-ууд */
    if (dto.language !== undefined) data.language = dto.language;
    if (dto.starterCode !== undefined) data.starterCode = dto.starterCode;
    if (dto.testCases !== undefined) data.testCases = dto.testCases;
    if (dto.solution !== undefined) data.solution = dto.solution;

    /** essay field-ууд */
    if (dto.minWords !== undefined) data.minWords = dto.minWords;
    if (dto.maxWords !== undefined) data.maxWords = dto.maxWords;
    if (dto.rubric !== undefined) data.rubric = dto.rubric;

    return data;
  }

  /**
   * Асуултын төрлөөс хамаарсан validation.
   * Төрөл солигдож байвал шинэ төрлийн бүх шаардлагатай field-ууд байх ёстой.
   * Төрөл солигдоогүй бол DTO + одоо байгаа утгууд нийлээд шалгана.
   */
  private validateQuestionType(
    type: string,
    updateData: Record<string, any>,
    existing: Record<string, any>,
  ): void {
    /** Merge хийсэн утгууд — шинэчлэлт + хуучин утга */
    const merged = { ...existing, ...updateData };

    switch (type) {
      case 'multiple_choice':
        if (!merged.options || merged.options.length < 2) {
          throw new BadRequestException('Олон сонголттой асуулт дор хаяж 2 сонголттой байх ёстой');
        }
        const correctCount = merged.options.filter(
          (o: { isCorrect: boolean }) => o.isCorrect,
        ).length;
        if (correctCount !== 1) {
          throw new BadRequestException('Олон сонголттой асуулт яг нэг зөв хариулттай байх ёстой');
        }
        break;

      case 'true_false':
        if (merged.correctAnswer === undefined || merged.correctAnswer === null) {
          throw new BadRequestException('Үнэн/Худал асуулт correctAnswer утгатай байх ёстой');
        }
        break;

      case 'fill_blank':
        if (!merged.correctAnswers || merged.correctAnswers.length < 1) {
          throw new BadRequestException('Нөхөх асуулт дор хаяж 1 зөв хариулттай байх ёстой');
        }
        break;

      case 'code_challenge':
        if (!merged.language) {
          throw new BadRequestException('Код бичих асуулт програмчлалын хэлтэй байх ёстой');
        }
        if (!merged.starterCode) {
          throw new BadRequestException('Код бичих асуулт эхлэх кодтой байх ёстой');
        }
        if (!merged.testCases || merged.testCases.length < 1) {
          throw new BadRequestException('Код бичих асуулт дор хаяж 1 тест тохиолдолтой байх ёстой');
        }
        break;

      case 'essay':
        /** Essay төрөлд нэмэлт validation шаардлагагүй */
        break;
    }
  }
}
