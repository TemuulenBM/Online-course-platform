import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** Сонголтын хариулт (multiple_choice) */
export class QuestionOption {
  @Prop({ required: true })
  optionId!: string;

  @Prop({ required: true })
  text!: string;

  @Prop({ required: true })
  isCorrect!: boolean;
}

/** Код тестийн тохиолдол (code_challenge) */
export class TestCase {
  @Prop({ required: true })
  input!: string;

  @Prop({ required: true })
  expectedOutput!: string;
}

/** Дүгнэлтийн шалгуур (essay) */
export class RubricCriterion {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  points!: number;

  @Prop()
  description?: string;
}

/** Дүгнэлтийн загвар (essay) */
export class Rubric {
  @Prop({ type: [RubricCriterion], default: [] })
  criteria!: RubricCriterion[];
}

/** Асуулт */
export class Question {
  @Prop({ required: true })
  questionId!: string;

  @Prop({
    required: true,
    enum: ['multiple_choice', 'true_false', 'fill_blank', 'code_challenge', 'essay'],
  })
  type!: string;

  @Prop({ required: true })
  questionText!: string;

  @Prop({ required: true })
  points!: number;

  @Prop({ required: true })
  orderIndex!: number;

  /** multiple_choice — сонголтууд */
  @Prop({ type: [QuestionOption], default: undefined })
  options?: QuestionOption[];

  /** true_false — зөв хариулт */
  @Prop({ type: Boolean, default: undefined })
  correctAnswer?: boolean;

  /** fill_blank — зөв хариултууд */
  @Prop({ type: [String], default: undefined })
  correctAnswers?: string[];

  /** fill_blank — том жижиг үсэг ялгах эсэх */
  @Prop({ type: Boolean, default: undefined })
  caseSensitive?: boolean;

  /** code_challenge — програмчлалын хэл */
  @Prop({ default: undefined })
  language?: string;

  /** code_challenge — эхлэх код */
  @Prop({ default: undefined })
  starterCode?: string;

  /** code_challenge — тест тохиолдлууд */
  @Prop({ type: [TestCase], default: undefined })
  testCases?: TestCase[];

  /** code_challenge — зөв шийдэл */
  @Prop({ default: undefined })
  solution?: string;

  /** essay — хамгийн бага үгийн тоо */
  @Prop({ type: Number, default: undefined })
  minWords?: number;

  /** essay — хамгийн их үгийн тоо */
  @Prop({ type: Number, default: undefined })
  maxWords?: number;

  /** essay — дүгнэлтийн загвар */
  @Prop({ type: Rubric, default: undefined })
  rubric?: Rubric;

  /** Тайлбар (зөв хариултын тайлбар) */
  @Prop({ default: undefined })
  explanation?: string;

  /** Хүндрэлийн зэрэг */
  @Prop({ enum: ['easy', 'medium', 'hard'], default: undefined })
  difficulty?: string;

  /** Шошго */
  @Prop({ type: [String], default: undefined })
  tags?: string[];
}

/**
 * Quiz асуултуудын schema.
 * MongoDB-ийн quiz_questions collection-д хадгалагдана.
 * Нэг quiz-д нэг document — quizId unique index-тэй.
 */
@Schema({
  collection: 'quiz_questions',
  timestamps: true,
})
export class QuizQuestions {
  @Prop({ required: true, unique: true, index: true })
  quizId!: string;

  @Prop({ type: [Question], default: [] })
  questions!: Question[];
}

export type QuizQuestionsDocument = HydratedDocument<QuizQuestions>;
export const QuizQuestionsSchema = SchemaFactory.createForClass(QuizQuestions);
