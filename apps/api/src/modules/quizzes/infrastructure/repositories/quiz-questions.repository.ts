import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizQuestions, QuizQuestionsDocument } from '../schemas/quiz-questions.schema';

/**
 * Quiz асуултууд repository.
 * MongoDB-ийн quiz_questions collection-тэй харьцах CRUD үйлдлүүд.
 */
@Injectable()
export class QuizQuestionsRepository {
  private readonly logger = new Logger(QuizQuestionsRepository.name);

  constructor(
    @InjectModel(QuizQuestions.name)
    private readonly questionsModel: Model<QuizQuestionsDocument>,
  ) {}

  /** Хоосон quiz_questions document үүсгэх */
  async create(quizId: string): Promise<QuizQuestionsDocument> {
    const doc = await this.questionsModel.create({ quizId, questions: [] });
    this.logger.debug(`Quiz questions document үүсгэгдлээ: quizId=${quizId}`);
    return doc;
  }

  /** Quiz ID-аар асуултууд авах */
  async findByQuizId(quizId: string): Promise<QuizQuestionsDocument | null> {
    return this.questionsModel.findOne({ quizId }).exec();
  }

  /** Асуулт нэмэх */
  async addQuestion(
    quizId: string,
    question: Record<string, any>,
  ): Promise<QuizQuestionsDocument | null> {
    const doc = await this.questionsModel
      .findOneAndUpdate({ quizId }, { $push: { questions: question } }, { new: true })
      .exec();
    if (doc) {
      this.logger.debug(`Асуулт нэмэгдлээ: quizId=${quizId}, questionId=${question.questionId}`);
    }
    return doc;
  }

  /** Асуулт шинэчлэх */
  async updateQuestion(
    quizId: string,
    questionId: string,
    updateData: Record<string, any>,
  ): Promise<QuizQuestionsDocument | null> {
    /** questions array дотор тохирох questionId-тай элементийг олж шинэчлэнэ */
    const setFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateData)) {
      setFields[`questions.$.${key}`] = value;
    }

    const doc = await this.questionsModel
      .findOneAndUpdate(
        { quizId, 'questions.questionId': questionId },
        { $set: setFields },
        { new: true },
      )
      .exec();
    if (doc) {
      this.logger.debug(`Асуулт шинэчлэгдлээ: quizId=${quizId}, questionId=${questionId}`);
    }
    return doc;
  }

  /** Асуулт устгах */
  async deleteQuestion(quizId: string, questionId: string): Promise<QuizQuestionsDocument | null> {
    const doc = await this.questionsModel
      .findOneAndUpdate({ quizId }, { $pull: { questions: { questionId } } }, { new: true })
      .exec();
    if (doc) {
      this.logger.debug(`Асуулт устгагдлаа: quizId=${quizId}, questionId=${questionId}`);
    }
    return doc;
  }

  /** Асуултуудын дарааллыг өөрчлөх */
  async reorderQuestions(
    quizId: string,
    questionOrder: { questionId: string; orderIndex: number }[],
  ): Promise<QuizQuestionsDocument | null> {
    const doc = await this.questionsModel.findOne({ quizId }).exec();
    if (!doc) return null;

    /** orderIndex-г шинэчлэх */
    const orderMap = new Map(questionOrder.map((q) => [q.questionId, q.orderIndex]));
    for (const question of doc.questions) {
      const newOrder = orderMap.get(question.questionId);
      if (newOrder !== undefined) {
        question.orderIndex = newOrder;
      }
    }

    /** orderIndex-аар эрэмбэлж хадгалах */
    doc.questions.sort((a, b) => a.orderIndex - b.orderIndex);
    await doc.save();

    this.logger.debug(`Асуултуудын дараалал өөрчлөгдлөө: quizId=${quizId}`);
    return doc;
  }

  /** Quiz-ийн бүх асуултыг устгах */
  async deleteByQuizId(quizId: string): Promise<void> {
    await this.questionsModel.deleteOne({ quizId }).exec();
    this.logger.debug(`Quiz questions устгагдлаа: quizId=${quizId}`);
  }
}
