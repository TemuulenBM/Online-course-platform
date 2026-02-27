'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Info, Timer, Settings, Trash2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  useQuizByLessonId,
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
} from '@/hooks/api/use-quizzes';
import type { Quiz, CreateQuizData, UpdateQuizData } from '@/lib/api-services/quizzes.service';

interface QuizManagementFormProps {
  lessonId: string;
  courseId: string;
}

interface FormValues {
  title: string;
  description: string;
  timeLimitMinutes: number | null;
  passingScorePercentage: number;
  maxAttempts: number | null;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
}

/**
 * Quiz тохиргооны форм — Багш/Админ хэрэглэнэ.
 * Quiz байхгүй бол үүсгэх, байвал шинэчлэх.
 */
export function QuizManagementForm({ lessonId, courseId }: QuizManagementFormProps) {
  const t = useTranslations('quiz');

  const { data: quiz, isLoading } = useQuizByLessonId(lessonId);
  const createMutation = useCreateQuiz();
  const updateMutation = useUpdateQuiz();
  const deleteMutation = useDeleteQuiz();

  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      timeLimitMinutes: 30,
      passingScorePercentage: 70,
      maxAttempts: 3,
      randomizeQuestions: false,
      randomizeOptions: false,
    },
  });

  /** Quiz дата-аар form-г дүүргэх */
  useEffect(() => {
    if (quiz) {
      form.reset({
        title: quiz.title,
        description: quiz.description || '',
        timeLimitMinutes: quiz.timeLimitMinutes,
        passingScorePercentage: quiz.passingScorePercentage,
        maxAttempts: quiz.maxAttempts,
        randomizeQuestions: quiz.randomizeQuestions,
        randomizeOptions: quiz.randomizeOptions,
      });
    }
  }, [quiz, form]);

  const onSubmit = (values: FormValues) => {
    if (quiz) {
      /** Шинэчлэх */
      const data: UpdateQuizData = {
        title: values.title,
        description: values.description || undefined,
        timeLimitMinutes: values.timeLimitMinutes,
        passingScorePercentage: values.passingScorePercentage,
        maxAttempts: values.maxAttempts,
        randomizeQuestions: values.randomizeQuestions,
        randomizeOptions: values.randomizeOptions,
      };
      updateMutation.mutate(
        { id: quiz.id, data },
        {
          onSuccess: () => toast.success(t('quizSaved')),
          onError: (err: Error) => toast.error(err.message),
        },
      );
    } else {
      /** Үүсгэх */
      const data: CreateQuizData = {
        lessonId,
        title: values.title,
        description: values.description || undefined,
        timeLimitMinutes: values.timeLimitMinutes,
        passingScorePercentage: values.passingScorePercentage,
        maxAttempts: values.maxAttempts,
        randomizeQuestions: values.randomizeQuestions,
        randomizeOptions: values.randomizeOptions,
      };
      createMutation.mutate(data, {
        onSuccess: () => toast.success(t('quizSaved')),
        onError: (err: Error) => toast.error(err.message),
      });
    }
  };

  const handleDelete = () => {
    if (!quiz) return;
    if (!confirm(t('deleteQuiz') + '?')) return;
    deleteMutation.mutate(quiz.id, {
      onSuccess: () => toast.success(t('quizDeleted')),
      onError: (err: Error) => toast.error(err.message),
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Ерөнхий мэдээлэл */}
      <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">
          <Info className="size-5" />
          {t('generalInfo')}
        </h3>
        <div className="space-y-4">
          <div>
            <Label>{t('quizTitle')}</Label>
            <Input
              {...form.register('title', { required: true })}
              placeholder={t('quizTitlePlaceholder')}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t('quizDescription')}</Label>
            <Textarea
              {...form.register('description')}
              placeholder={t('quizDescriptionPlaceholder')}
              rows={4}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Хугацаа болон оноо */}
      <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">
          <Timer className="size-5" />
          {t('timeAndScoring')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label>{t('timeLimit')}</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                {...form.register('timeLimitMinutes', { valueAsNumber: true })}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">{t('minutes')}</span>
            </div>
          </div>
          <div>
            <Label>{t('passingScore')}</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                {...form.register('passingScorePercentage', { valueAsNumber: true })}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <div>
            <Label>{t('maxAttempts')}</Label>
            <Input
              type="number"
              {...form.register('maxAttempts', { valueAsNumber: true })}
              className="mt-1 w-24"
            />
          </div>
        </div>
      </div>

      {/* Нэмэлт тохиргоо */}
      <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">
          <Settings className="size-5" />
          {t('additionalSettings')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
            <div>
              <p className="font-semibold text-sm">{t('randomizeQuestions')}</p>
              <p className="text-xs text-muted-foreground">{t('randomizeQuestionsDesc')}</p>
            </div>
            <Switch
              checked={form.watch('randomizeQuestions')}
              onCheckedChange={(v) => form.setValue('randomizeQuestions', v)}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
            <div>
              <p className="font-semibold text-sm">{t('randomizeOptions')}</p>
              <p className="text-xs text-muted-foreground">{t('randomizeOptionsDesc')}</p>
            </div>
            <Switch
              checked={form.watch('randomizeOptions')}
              onCheckedChange={(v) => form.setValue('randomizeOptions', v)}
            />
          </div>
        </div>
      </div>

      {/* Товчууд */}
      <div className="flex items-center justify-between">
        {quiz && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
          >
            <Trash2 className="size-4" />
            {t('deleteQuiz')}
          </button>
        )}
        <div className="ml-auto">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isSaving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
