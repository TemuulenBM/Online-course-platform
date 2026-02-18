import { Injectable, Logger } from '@nestjs/common';

/**
 * Quiz автомат дүгнэлтийн сервис.
 * multiple_choice, true_false, fill_blank төрлүүдийг автомат дүгнэнэ.
 * essay, code_challenge → гараар дүгнэх хүртэл pointsEarned=0.
 */
@Injectable()
export class QuizGradingService {
  private readonly logger = new Logger(QuizGradingService.name);

  /**
   * Бүх хариултыг дүгнэж, оноо тооцоолно.
   * @returns Дүгнэсэн хариултууд + нийт оноо
   */
  gradeAnswers(
    answers: Array<{
      questionId: string;
      answerData: Record<string, any>;
    }>,
    questions: Array<Record<string, any>>,
  ): {
    gradedAnswers: Array<{
      questionId: string;
      answerData: Record<string, any>;
    }>;
    score: number;
    maxScore: number;
  } {
    const questionMap = new Map(questions.map((q) => [q.questionId, q]));
    let score = 0;
    let maxScore = 0;

    const gradedAnswers = answers.map((answer) => {
      const question = questionMap.get(answer.questionId);
      if (!question) return answer;

      maxScore += question.points;
      const graded = this.gradeAnswer(answer.answerData, question);

      if (graded.isCorrect === true) {
        score += graded.pointsEarned;
      }

      return {
        questionId: answer.questionId,
        answerData: { ...answer.answerData, ...graded },
      };
    });

    this.logger.debug(`Дүгнэлт: score=${score}/${maxScore}`);
    return { gradedAnswers, score, maxScore };
  }

  /** Нэг хариултыг төрлөөс хамааран дүгнэх */
  private gradeAnswer(
    answerData: Record<string, any>,
    question: Record<string, any>,
  ): { isCorrect: boolean | null; pointsEarned: number } {
    switch (question.type) {
      case 'multiple_choice':
        return this.gradeMultipleChoice(answerData, question);
      case 'true_false':
        return this.gradeTrueFalse(answerData, question);
      case 'fill_blank':
        return this.gradeFillBlank(answerData, question);
      case 'code_challenge':
      case 'essay':
        /** Гараар дүгнэх — одоохондоо 0 оноо */
        return { isCorrect: null, pointsEarned: 0 };
      default:
        return { isCorrect: null, pointsEarned: 0 };
    }
  }

  /** Multiple choice дүгнэлт */
  private gradeMultipleChoice(
    answerData: Record<string, any>,
    question: Record<string, any>,
  ): { isCorrect: boolean; pointsEarned: number } {
    const selectedOption = answerData.selectedOption;
    const correctOption = question.options?.find((o: any) => o.isCorrect === true);

    const isCorrect = correctOption?.optionId === selectedOption;
    return {
      isCorrect,
      pointsEarned: isCorrect ? question.points : 0,
    };
  }

  /** True/False дүгнэлт */
  private gradeTrueFalse(
    answerData: Record<string, any>,
    question: Record<string, any>,
  ): { isCorrect: boolean; pointsEarned: number } {
    const isCorrect = answerData.selectedAnswer === question.correctAnswer;
    return {
      isCorrect,
      pointsEarned: isCorrect ? question.points : 0,
    };
  }

  /** Fill blank дүгнэлт */
  private gradeFillBlank(
    answerData: Record<string, any>,
    question: Record<string, any>,
  ): { isCorrect: boolean; pointsEarned: number } {
    const filledAnswer = (answerData.filledAnswer ?? '').trim();
    const correctAnswers: string[] = question.correctAnswers ?? [];
    const caseSensitive = question.caseSensitive ?? false;

    const isCorrect = correctAnswers.some((correct) =>
      caseSensitive
        ? correct.trim() === filledAnswer
        : correct.trim().toLowerCase() === filledAnswer.toLowerCase(),
    );

    return {
      isCorrect,
      pointsEarned: isCorrect ? question.points : 0,
    };
  }
}
