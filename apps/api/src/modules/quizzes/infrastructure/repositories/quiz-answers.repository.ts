import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizAnswers, QuizAnswersDocument } from '../schemas/quiz-answers.schema';

/**
 * Quiz хариултууд repository.
 * MongoDB-ийн quiz_answers collection-тэй харьцах CRUD үйлдлүүд.
 */
@Injectable()
export class QuizAnswersRepository {
  private readonly logger = new Logger(QuizAnswersRepository.name);

  constructor(
    @InjectModel(QuizAnswers.name)
    private readonly answersModel: Model<QuizAnswersDocument>,
  ) {}

  /** Хариулт хадгалах */
  async create(data: {
    attemptId: string;
    userId: string;
    quizId: string;
    answers: Array<{
      questionId: string;
      answerData: Record<string, any>;
    }>;
    submittedAt: Date;
  }): Promise<QuizAnswersDocument> {
    const doc = await this.answersModel.create(data);
    this.logger.debug(`Quiz answers хадгалагдлаа: attemptId=${data.attemptId}`);
    return doc;
  }

  /** Attempt ID-аар хариулт авах */
  async findByAttemptId(attemptId: string): Promise<QuizAnswersDocument | null> {
    return this.answersModel.findOne({ attemptId }).exec();
  }

  /** Тодорхой асуултын хариулт дүгнэх (essay/code) */
  async gradeAnswer(
    attemptId: string,
    questionId: string,
    gradeData: {
      pointsEarned: number;
      isCorrect: boolean;
      feedback?: string;
      gradedBy: string;
      gradedAt: Date;
      rubricScores?: Array<{ criterion: string; points: number }>;
    },
  ): Promise<QuizAnswersDocument | null> {
    const setFields: Record<string, any> = {
      'answers.$.answerData.pointsEarned': gradeData.pointsEarned,
      'answers.$.answerData.isCorrect': gradeData.isCorrect,
      'answers.$.answerData.gradedBy': gradeData.gradedBy,
      'answers.$.answerData.gradedAt': gradeData.gradedAt,
    };

    if (gradeData.feedback !== undefined) {
      setFields['answers.$.answerData.feedback'] = gradeData.feedback;
    }
    if (gradeData.rubricScores !== undefined) {
      setFields['answers.$.answerData.rubricScores'] = gradeData.rubricScores;
    }

    const doc = await this.answersModel
      .findOneAndUpdate(
        { attemptId, 'answers.questionId': questionId },
        { $set: setFields },
        { new: true },
      )
      .exec();

    if (doc) {
      this.logger.debug(`Хариулт дүгнэгдлээ: attemptId=${attemptId}, questionId=${questionId}`);
    }
    return doc;
  }

  /** Бүх хариултыг градацалсан эсэх шалгаж gradedAt тавих */
  async markFullyGraded(attemptId: string): Promise<void> {
    await this.answersModel.updateOne({ attemptId }, { $set: { gradedAt: new Date() } }).exec();
  }

  /** Attempt-ийн хариултуудыг устгах */
  async deleteByAttemptId(attemptId: string): Promise<void> {
    await this.answersModel.deleteOne({ attemptId }).exec();
    this.logger.debug(`Quiz answers устгагдлаа: attemptId=${attemptId}`);
  }

  /** Quiz-ийн бүх хариултыг устгах */
  async deleteByQuizId(quizId: string): Promise<void> {
    await this.answersModel.deleteMany({ quizId }).exec();
    this.logger.debug(`Quiz-ийн бүх answers устгагдлаа: quizId=${quizId}`);
  }
}
