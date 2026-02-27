'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizzesService } from '@/lib/api-services/quizzes.service';
import type {
  CreateQuizData,
  UpdateQuizData,
  AddQuestionData,
  UpdateQuestionData,
  ReorderQuestionsData,
  SubmitAttemptData,
  GradeAttemptData,
  StudentAttemptsParams,
} from '@/lib/api-services/quizzes.service';
import { QUERY_KEYS } from '@/lib/constants';

// --- Query hooks ---

/** Хичээлийн quiz авах */
export function useQuizByLessonId(lessonId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.quizzes.byLesson(lessonId),
    queryFn: () => quizzesService.getByLessonId(lessonId),
    enabled: !!lessonId,
  });
}

/** ID-аар quiz авах (асуултуудтай) */
export function useQuizById(quizId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.quizzes.byId(quizId),
    queryFn: () => quizzesService.getById(quizId),
    enabled: !!quizId,
  });
}

/** Миний оролдлогууд */
export function useMyAttempts(quizId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.quizzes.myAttempts(quizId),
    queryFn: () => quizzesService.getMyAttempts(quizId),
    enabled: !!quizId,
  });
}

/** Оюутнуудын оролдлого (багш/админ) */
export function useStudentAttempts(quizId: string, params?: StudentAttemptsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.quizzes.studentAttempts(quizId, params),
    queryFn: () => quizzesService.getStudentAttempts(quizId, params),
    enabled: !!quizId,
  });
}

/** Оролдлогын дэлгэрэнгүй */
export function useAttemptDetail(quizId: string, attemptId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.quizzes.attemptDetail(quizId, attemptId),
    queryFn: () => quizzesService.getAttempt(quizId, attemptId),
    enabled: !!quizId && !!attemptId,
  });
}

// --- Mutation hooks ---

/** Шинэ quiz үүсгэх */
export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuizData) => quizzesService.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.quizzes.byLesson(variables.lessonId),
      });
    },
  });
}

/** Quiz шинэчлэх */
export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuizData }) =>
      quizzesService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quizzes.byId(variables.id) });
    },
  });
}

/** Quiz устгах */
export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quizzesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

/** Асуулт нэмэх */
export function useAddQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: AddQuestionData }) =>
      quizzesService.addQuestion(quizId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quizzes.byId(variables.quizId) });
    },
  });
}

/** Асуулт шинэчлэх */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      quizId,
      questionId,
      data,
    }: {
      quizId: string;
      questionId: string;
      data: UpdateQuestionData;
    }) => quizzesService.updateQuestion(quizId, questionId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quizzes.byId(variables.quizId) });
    },
  });
}

/** Асуулт устгах */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, questionId }: { quizId: string; questionId: string }) =>
      quizzesService.deleteQuestion(quizId, questionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quizzes.byId(variables.quizId) });
    },
  });
}

/** Асуултуудын дараалал солих */
export function useReorderQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: ReorderQuestionsData }) =>
      quizzesService.reorderQuestions(quizId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quizzes.byId(variables.quizId) });
    },
  });
}

/** Quiz оролдлого эхлүүлэх */
export function useStartAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quizId: string) => quizzesService.startAttempt(quizId),
    onSuccess: (_data, quizId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quizzes.myAttempts(quizId) });
    },
  });
}

/** Хариулт илгээх */
export function useSubmitAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      quizId,
      attemptId,
      data,
    }: {
      quizId: string;
      attemptId: string;
      data: SubmitAttemptData;
    }) => quizzesService.submitAttempt(quizId, attemptId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quizzes.myAttempts(variables.quizId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.quizzes.attemptDetail(variables.quizId, variables.attemptId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.quizzes.studentAttempts(variables.quizId),
      });
    },
  });
}

/** Гараар дүгнэх (essay/code) */
export function useGradeAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: string; data: GradeAttemptData }) =>
      quizzesService.gradeAttempt(attemptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}
