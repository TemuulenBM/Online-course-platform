import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** Дүгнэлтийн шалгуурын оноо (essay) */
export class RubricScore {
  @Prop({ required: true })
  criterion!: string;

  @Prop({ required: true })
  points!: number;
}

/** Хариултын өгөгдөл — төрлөөс хамааран өөр бүтэцтэй */
export class AnswerData {
  @Prop({ required: true })
  type!: string;

  /** multiple_choice — сонгосон хариулт */
  @Prop({ default: undefined })
  selectedOption?: string;

  /** true_false — хариулт */
  @Prop({ type: Boolean, default: undefined })
  selectedAnswer?: boolean;

  /** fill_blank — бичсэн хариулт */
  @Prop({ default: undefined })
  filledAnswer?: string;

  /** code_challenge — илгээсэн код */
  @Prop({ default: undefined })
  submittedCode?: string;

  /** code_challenge — тест үр дүнгүүд */
  @Prop({ type: [Object], default: undefined })
  testResults?: Array<{ testCase: number; passed: boolean }>;

  /** essay — илгээсэн текст */
  @Prop({ default: undefined })
  submittedText?: string;

  /** essay — үгийн тоо */
  @Prop({ type: Number, default: undefined })
  wordCount?: number;

  /** essay — дүгнэлтийн шалгуурын оноо */
  @Prop({ type: [RubricScore], default: undefined })
  rubricScores?: RubricScore[];

  /** essay — дүгнэсэн багшийн тайлбар */
  @Prop({ default: undefined })
  feedback?: string;

  /** essay — дүгнэсэн багшийн ID */
  @Prop({ default: undefined })
  gradedBy?: string;

  /** essay — дүгнэсэн огноо */
  @Prop({ type: Date, default: undefined })
  gradedAt?: Date;

  /** Зөв хариулт эсэх */
  @Prop({ type: Boolean, default: undefined })
  isCorrect?: boolean;

  /** Авсан оноо */
  @Prop({ type: Number, default: 0 })
  pointsEarned!: number;

  /** Зарцуулсан хугацаа (секунд) */
  @Prop({ type: Number, default: 0 })
  timeSpentSeconds!: number;
}

/** Асуултын хариулт */
export class Answer {
  @Prop({ required: true })
  questionId!: string;

  @Prop({ type: AnswerData, required: true })
  answerData!: AnswerData;
}

/**
 * Quiz хариултуудын schema.
 * MongoDB-ийн quiz_answers collection-д хадгалагдана.
 * Нэг attempt-д нэг document — attemptId unique index-тэй.
 */
@Schema({
  collection: 'quiz_answers',
  timestamps: false,
})
export class QuizAnswers {
  @Prop({ required: true, unique: true, index: true })
  attemptId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  quizId!: string;

  @Prop({ type: [Answer], default: [] })
  answers!: Answer[];

  @Prop({ type: Date })
  submittedAt?: Date;

  @Prop({ type: Date, default: undefined })
  gradedAt?: Date;
}

export type QuizAnswersDocument = HydratedDocument<QuizAnswers>;
export const QuizAnswersSchema = SchemaFactory.createForClass(QuizAnswers);
