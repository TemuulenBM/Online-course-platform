'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, AnswerData } from '@/lib/api-services/quizzes.service';

interface QuizAttemptState {
  /** Quiz ID */
  quizId: string | null;
  /** Оролдлогын ID */
  attemptId: string | null;
  /** Асуултуудын жагсаалт */
  questions: Question[];
  /** Хариултууд: questionId → answerData */
  answers: Record<string, AnswerData>;
  /** Тэмдэглэгдсэн асуултууд (bookmark/flag) */
  bookmarkedQuestions: string[];
  /** Асуулт тус бүрд зарцуулсан хугацаа (секунд) */
  questionTimeSpent: Record<string, number>;
  /** Одоогийн асуултын индекс */
  currentQuestionIndex: number;
  /** Үлдсэн хугацаа (секунд) */
  timeRemainingSeconds: number;
  /** Хугацааны хязгаартай эсэх */
  hasTimeLimit: boolean;
  /** Илгээж байгаа эсэх */
  isSubmitting: boolean;
  /** Hydrate хийгдсэн эсэх */
  isHydrated: boolean;

  // --- Actions ---

  /** Шинэ оролдлого эхлүүлэх */
  initAttempt: (
    quizId: string,
    attemptId: string,
    questions: Question[],
    timeLimitSeconds: number | null,
  ) => void;
  /** Хариулт хадгалах */
  setAnswer: (questionId: string, answerData: AnswerData) => void;
  /** Асуулт тэмдэглэх/тэмдэг авах (toggle) */
  toggleBookmark: (questionId: string) => void;
  /** Тухайн асуултын хугацааг нэмэх */
  addQuestionTime: (questionId: string, seconds: number) => void;
  /** Тодорхой асуулт руу очих */
  goToQuestion: (index: number) => void;
  /** Дараагийн асуулт руу */
  nextQuestion: () => void;
  /** Өмнөх асуулт руу */
  prevQuestion: () => void;
  /** Таймер tick (1 секунд хасах) */
  tick: () => void;
  /** Илгээж байгаа төлөв */
  setSubmitting: (value: boolean) => void;
  /** Оролдлого цэвэрлэх */
  clearAttempt: () => void;
  /** Hydrate хийгдсэн */
  setHydrated: () => void;
}

/** Хариулсан асуултуудын тоог тооцоолох */
export function getAnsweredCount(answers: Record<string, AnswerData>): number {
  return Object.keys(answers).length;
}

/** Хариулаагүй асуултуудын тоог тооцоолох */
export function getUnansweredCount(
  questions: Question[],
  answers: Record<string, AnswerData>,
): number {
  return questions.length - getAnsweredCount(answers);
}

/** Асуултын төлвийг олох: 'answered' | 'current' | 'bookmarked' | 'unanswered' */
export function getQuestionStatus(
  questionId: string,
  answers: Record<string, AnswerData>,
  bookmarkedQuestions: string[],
  currentQuestionIndex: number,
  questions: Question[],
): 'answered' | 'current' | 'bookmarked' | 'unanswered' {
  if (questions[currentQuestionIndex]?.questionId === questionId) return 'current';
  if (bookmarkedQuestions.includes(questionId)) return 'bookmarked';
  if (answers[questionId]) return 'answered';
  return 'unanswered';
}

export const useQuizStore = create<QuizAttemptState>()(
  persist(
    (set, get) => ({
      quizId: null,
      attemptId: null,
      questions: [],
      answers: {},
      bookmarkedQuestions: [],
      questionTimeSpent: {},
      currentQuestionIndex: 0,
      timeRemainingSeconds: 0,
      hasTimeLimit: false,
      isSubmitting: false,
      isHydrated: false,

      initAttempt: (quizId, attemptId, questions, timeLimitSeconds) =>
        set({
          quizId,
          attemptId,
          questions,
          answers: {},
          bookmarkedQuestions: [],
          questionTimeSpent: {},
          currentQuestionIndex: 0,
          timeRemainingSeconds: timeLimitSeconds ?? 0,
          hasTimeLimit: timeLimitSeconds !== null && timeLimitSeconds > 0,
          isSubmitting: false,
        }),

      setAnswer: (questionId, answerData) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answerData },
        })),

      toggleBookmark: (questionId) =>
        set((state) => {
          const isBookmarked = state.bookmarkedQuestions.includes(questionId);
          return {
            bookmarkedQuestions: isBookmarked
              ? state.bookmarkedQuestions.filter((id) => id !== questionId)
              : [...state.bookmarkedQuestions, questionId],
          };
        }),

      addQuestionTime: (questionId, seconds) =>
        set((state) => ({
          questionTimeSpent: {
            ...state.questionTimeSpent,
            [questionId]: (state.questionTimeSpent[questionId] || 0) + seconds,
          },
        })),

      goToQuestion: (index) => {
        const { questions } = get();
        if (index >= 0 && index < questions.length) {
          set({ currentQuestionIndex: index });
        }
      },

      nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex < questions.length - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        }
      },

      prevQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
      },

      tick: () =>
        set((state) => ({
          timeRemainingSeconds: Math.max(0, state.timeRemainingSeconds - 1),
        })),

      setSubmitting: (value) => set({ isSubmitting: value }),

      clearAttempt: () =>
        set({
          quizId: null,
          attemptId: null,
          questions: [],
          answers: {},
          bookmarkedQuestions: [],
          questionTimeSpent: {},
          currentQuestionIndex: 0,
          timeRemainingSeconds: 0,
          hasTimeLimit: false,
          isSubmitting: false,
        }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'ocp-quiz-attempt',
      partialize: (state) => ({
        quizId: state.quizId,
        attemptId: state.attemptId,
        questions: state.questions,
        answers: state.answers,
        bookmarkedQuestions: state.bookmarkedQuestions,
        questionTimeSpent: state.questionTimeSpent,
        currentQuestionIndex: state.currentQuestionIndex,
        timeRemainingSeconds: state.timeRemainingSeconds,
        hasTimeLimit: state.hasTimeLimit,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
