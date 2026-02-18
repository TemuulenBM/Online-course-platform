import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QuizQuestionsRepository } from '../../infrastructure/repositories/quiz-questions.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { QuizEntity } from '../../domain/entities/quiz.entity';

/**
 * Quiz-ийн дэлгэрэнгүй мэдээлэл авах use case.
 * Quiz metadata болон асуултуудыг буцаана.
 * Багш/админ бол зөв хариултуудтай, оюутан бол зөв хариултгүйгээр буцаана.
 */
@Injectable()
export class GetQuizUseCase {
  private readonly logger = new Logger(GetQuizUseCase.name);

  constructor(
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
    private readonly quizCacheService: QuizCacheService,
  ) {}

  /**
   * Quiz-ийн дэлгэрэнгүй мэдээлэл авах.
   * @param quizId - Quiz-ийн ID
   * @param userId - Одоогийн хэрэглэгчийн ID (optional)
   * @param userRole - Одоогийн хэрэглэгчийн эрх (optional)
   * @returns Quiz metadata болон асуултууд (эрхээс хамааран зөв хариулт байгаа/байхгүй)
   */
  async execute(
    quizId: string,
    userId?: string,
    userRole?: string,
  ): Promise<{ quiz: ReturnType<QuizEntity['toResponse']>; questions: any[] }> {
    /** 1. Quiz олдох эсэх шалгах (кэшнээс) */
    const quiz = await this.quizCacheService.getQuizById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz олдсонгүй');
    }

    /** 2. MongoDB-оос асуултууд авах */
    const questionsDoc = await this.quizQuestionsRepository.findByQuizId(quizId);
    const rawQuestions = questionsDoc?.questions ?? [];

    /** 3. Эрхийн шалгалт — багш/админ эсвэл quiz эзэмшигч бол зөв хариултуудтай буцаах */
    const isOwnerOrPrivileged =
      userRole === 'TEACHER' || userRole === 'ADMIN' || (userId && quiz.instructorId === userId);

    let processedQuestions: any[];

    if (isOwnerOrPrivileged) {
      /** Багш/админ — бүх мэдээллийг буцаана */
      processedQuestions = rawQuestions.map((q: any) => this.questionToObject(q));
    } else {
      /** Оюутан — зөв хариултуудыг арилгана */
      processedQuestions = rawQuestions.map((q: any) => this.stripCorrectAnswers(q));
    }

    this.logger.debug(
      `Quiz дэлгэрэнгүй: ${quizId}, асуултын тоо: ${processedQuestions.length}, эрх: ${isOwnerOrPrivileged ? 'full' : 'stripped'}`,
    );

    return {
      quiz: quiz.toResponse(),
      questions: processedQuestions,
    };
  }

  /**
   * Асуултыг энгийн объект руу хөрвүүлнэ.
   * @param question - MongoDB-ийн question document
   * @returns Бүх талбаруудтай объект
   */
  private questionToObject(question: any): Record<string, any> {
    const obj = question.toObject ? question.toObject() : { ...question };
    /** Mongoose-ийн _id талбарыг устгах */
    delete obj._id;
    return obj;
  }

  /**
   * Оюутны хувьд зөв хариултуудыг арилгана.
   * - multiple_choice: options дотор isCorrect-г устгана
   * - true_false: correctAnswer устгана
   * - fill_blank: correctAnswers устгана
   * - code_challenge: solution, testCases.expectedOutput устгана
   * - essay: rubric хэвээр үлдэнэ (шалгуурыг мэдэх нь зүйтэй)
   * @param question - MongoDB-ийн question document
   * @returns Зөв хариултгүй объект
   */
  private stripCorrectAnswers(question: any): Record<string, any> {
    const obj = question.toObject ? question.toObject() : { ...question };
    /** Mongoose-ийн _id талбарыг устгах */
    delete obj._id;

    /** multiple_choice — сонголтуудаас isCorrect устгах */
    if (obj.options && Array.isArray(obj.options)) {
      obj.options = obj.options.map((opt: any) => {
        const { isCorrect, _id, ...rest } = opt;
        return rest;
      });
    }

    /** true_false — зөв хариулт устгах */
    delete obj.correctAnswer;

    /** fill_blank — зөв хариултууд устгах */
    delete obj.correctAnswers;

    /** code_challenge — шийдэл устгах */
    delete obj.solution;

    /** code_challenge — testCases-ийн expectedOutput устгах */
    if (obj.testCases && Array.isArray(obj.testCases)) {
      obj.testCases = obj.testCases.map((tc: any) => {
        const { expectedOutput, expected_output, _id, ...rest } = tc;
        return rest;
      });
    }

    return obj;
  }
}
