import type { ApiResponse, PaginatedResponse } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

// --- Интерфэйсүүд ---

/** Quiz мэдээлэл */
export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  passingScorePercentage: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  maxAttempts: number | null;
  lessonTitle: string;
  lessonType: string;
  courseId: string;
  totalQuestions?: number;
  totalPoints?: number;
  createdAt: string;
  updatedAt: string;
}

/** Асуултын сонголт (multiple choice) */
export interface QuestionOption {
  optionId: string;
  text: string;
  isCorrect?: boolean;
}

/** Тестийн тохиолдол (code challenge) */
export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

/** Rubric шалгуур (essay) */
export interface RubricCriterion {
  name: string;
  maxPoints: number;
  description?: string;
}

/** Асуулт */
export interface Question {
  questionId: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'code_challenge' | 'essay';
  questionText: string;
  points: number;
  orderIndex: number;
  options?: QuestionOption[];
  correctAnswer?: boolean;
  correctAnswers?: string[];
  caseSensitive?: boolean;
  language?: string;
  starterCode?: string;
  testCases?: TestCase[];
  solution?: string;
  minWords?: number;
  maxWords?: number;
  rubric?: { criteria: RubricCriterion[] };
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

/** Quiz + асуултууд */
export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

/** Quiz оролдлого */
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number | null;
  maxScore: number | null;
  passed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
  createdAt: string;
  isInProgress: boolean;
  scorePercentage: number | null;
  quizTitle?: string;
  lessonId?: string;
}

/** Хариултын өгөгдөл (submit-д ашиглагдана) */
export interface AnswerData {
  selectedOption?: string;
  selectedAnswer?: boolean;
  filledAnswer?: string;
  submittedCode?: string;
  submittedText?: string;
}

/** Хариулт (оролдлогын дэлгэрэнгүй) */
export interface AttemptAnswer {
  questionId: string;
  answerData: AnswerData;
  isCorrect: boolean | null;
  pointsEarned: number | null;
  timeSpentSeconds?: number;
  feedback?: string;
  rubricScores?: { criterion: string; points: number }[];
}

/** Оролдлогын дэлгэрэнгүй (хариултуудтай) */
export interface AttemptDetail extends QuizAttempt {
  answers?: AttemptAnswer[];
}

/** Quiz үүсгэх өгөгдөл */
export interface CreateQuizData {
  lessonId: string;
  title: string;
  description?: string;
  timeLimitMinutes?: number | null;
  passingScorePercentage?: number;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  maxAttempts?: number | null;
}

/** Quiz шинэчлэх өгөгдөл */
export interface UpdateQuizData {
  title?: string;
  description?: string;
  timeLimitMinutes?: number | null;
  passingScorePercentage?: number;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  maxAttempts?: number | null;
}

/** Асуулт нэмэх өгөгдөл */
export interface AddQuestionData {
  type: Question['type'];
  questionText: string;
  points: number;
  options?: Omit<QuestionOption, 'optionId'>[];
  correctAnswer?: boolean;
  correctAnswers?: string[];
  caseSensitive?: boolean;
  language?: string;
  starterCode?: string;
  testCases?: TestCase[];
  solution?: string;
  minWords?: number;
  maxWords?: number;
  rubric?: { criteria: RubricCriterion[] };
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

/** Асуулт шинэчлэх өгөгдөл */
export type UpdateQuestionData = Partial<AddQuestionData>;

/** Дараалал солих өгөгдөл */
export interface ReorderQuestionsData {
  questionOrder: { questionId: string; orderIndex: number }[];
}

/** Хариулт илгээх өгөгдөл */
export interface SubmitAttemptData {
  answers: {
    questionId: string;
    answerData: AnswerData;
    timeSpentSeconds?: number;
  }[];
}

/** Гараар дүгнэх өгөгдөл */
export interface GradeAttemptData {
  questionId: string;
  pointsEarned: number;
  isCorrect: boolean;
  feedback?: string;
  rubricScores?: { criterion: string; points: number }[];
}

/** Оюутнуудын оролдлого жагсаалтын params */
export interface StudentAttemptsParams {
  page?: number;
  limit?: number;
  status?: string;
}

// --- Service ---

export const quizzesService = {
  /** Хичээлийн quiz авах */
  getByLessonId: async (lessonId: string): Promise<Quiz> => {
    const res = await client.get<ApiResponse<Quiz>>(`/quizzes/lesson/${lessonId}`);
    return res.data.data!;
  },

  /** ID-аар quiz авах (асуултуудтай) */
  getById: async (id: string): Promise<QuizWithQuestions> => {
    const res = await client.get<ApiResponse<QuizWithQuestions>>(`/quizzes/${id}`);
    return res.data.data!;
  },

  /** Шинэ quiz үүсгэх */
  create: async (data: CreateQuizData): Promise<Quiz> => {
    const res = await client.post<ApiResponse<Quiz>>('/quizzes', data);
    return res.data.data!;
  },

  /** Quiz шинэчлэх */
  update: async (id: string, data: UpdateQuizData): Promise<Quiz> => {
    const res = await client.patch<ApiResponse<Quiz>>(`/quizzes/${id}`, data);
    return res.data.data!;
  },

  /** Quiz устгах */
  delete: async (id: string): Promise<void> => {
    await client.delete(`/quizzes/${id}`);
  },

  /** Асуулт нэмэх */
  addQuestion: async (quizId: string, data: AddQuestionData): Promise<Question> => {
    const res = await client.post<ApiResponse<Question>>(`/quizzes/${quizId}/questions`, data);
    return res.data.data!;
  },

  /** Асуулт шинэчлэх */
  updateQuestion: async (
    quizId: string,
    questionId: string,
    data: UpdateQuestionData,
  ): Promise<Question> => {
    const res = await client.patch<ApiResponse<Question>>(
      `/quizzes/${quizId}/questions/${questionId}`,
      data,
    );
    return res.data.data!;
  },

  /** Асуулт устгах */
  deleteQuestion: async (quizId: string, questionId: string): Promise<void> => {
    await client.delete(`/quizzes/${quizId}/questions/${questionId}`);
  },

  /** Асуултуудын дараалал солих */
  reorderQuestions: async (quizId: string, data: ReorderQuestionsData): Promise<void> => {
    await client.patch(`/quizzes/${quizId}/questions/reorder`, data);
  },

  /** Quiz оролдлого эхлүүлэх */
  startAttempt: async (
    quizId: string,
  ): Promise<{ attempt: QuizAttempt; questions: Question[] }> => {
    const res = await client.post<ApiResponse<{ attempt: QuizAttempt; questions: Question[] }>>(
      `/quizzes/${quizId}/attempts`,
    );
    return res.data.data!;
  },

  /** Миний оролдлогууд */
  getMyAttempts: async (quizId: string): Promise<QuizAttempt[]> => {
    const res = await client.get<ApiResponse<QuizAttempt[]>>(`/quizzes/${quizId}/attempts/my`);
    return res.data.data!;
  },

  /** Оюутнуудын оролдлого (багш/админ) */
  getStudentAttempts: async (
    quizId: string,
    params?: StudentAttemptsParams,
  ): Promise<PaginatedResponse<QuizAttempt>> => {
    const res = await client.get<ApiResponse<PaginatedResponse<QuizAttempt>>>(
      `/quizzes/${quizId}/attempts/students`,
      { params },
    );
    return res.data.data!;
  },

  /** Оролдлогын дэлгэрэнгүй */
  getAttempt: async (quizId: string, attemptId: string): Promise<AttemptDetail> => {
    const res = await client.get<ApiResponse<AttemptDetail>>(
      `/quizzes/${quizId}/attempts/${attemptId}`,
    );
    return res.data.data!;
  },

  /** Хариулт илгээх */
  submitAttempt: async (
    quizId: string,
    attemptId: string,
    data: SubmitAttemptData,
  ): Promise<AttemptDetail> => {
    const res = await client.post<ApiResponse<AttemptDetail>>(
      `/quizzes/${quizId}/attempts/${attemptId}/submit`,
      data,
    );
    return res.data.data!;
  },

  /** Гараар дүгнэх (essay/code) */
  gradeAttempt: async (attemptId: string, data: GradeAttemptData): Promise<AttemptDetail> => {
    const res = await client.patch<ApiResponse<AttemptDetail>>(
      `/quizzes/attempts/${attemptId}/grade`,
      data,
    );
    return res.data.data!;
  },
};
