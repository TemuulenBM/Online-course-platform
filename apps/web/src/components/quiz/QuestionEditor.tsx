'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddQuestion, useUpdateQuestion } from '@/hooks/api/use-quizzes';
import type {
  Question,
  AddQuestionData,
  UpdateQuestionData,
} from '@/lib/api-services/quizzes.service';

interface QuestionEditorProps {
  quizId: string;
  question?: Question | null;
  onClose: () => void;
}

interface OptionField {
  text: string;
  isCorrect: boolean;
}

interface FormValues {
  type: Question['type'];
  questionText: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  options: OptionField[];
  correctAnswer?: boolean;
  correctAnswers?: string;
}

/**
 * Асуулт нэмэх/засварлах sidebar форм.
 */
export function QuestionEditor({ quizId, question, onClose }: QuestionEditorProps) {
  const t = useTranslations('quiz');
  const addMutation = useAddQuestion();
  const updateMutation = useUpdateQuestion();

  const form = useForm<FormValues>({
    defaultValues: {
      type: 'multiple_choice',
      questionText: '',
      points: 10,
      difficulty: 'easy',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ],
      correctAnswer: true,
      correctAnswers: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const questionType = form.watch('type');

  /** Засварлаж байгаа бол утга оруулах */
  useEffect(() => {
    if (question) {
      form.reset({
        type: question.type,
        questionText: question.questionText,
        points: question.points,
        difficulty: question.difficulty || 'easy',
        options:
          question.options?.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect || false,
          })) || [],
        correctAnswer: question.correctAnswer ?? true,
        correctAnswers: question.correctAnswers?.join(', ') || '',
      });
    }
  }, [question, form]);

  const onSubmit = (values: FormValues) => {
    const baseData: AddQuestionData = {
      type: values.type,
      questionText: values.questionText,
      points: values.points,
      difficulty: values.difficulty,
    };

    /** Төрлөөр нэмэлт талбар */
    if (values.type === 'multiple_choice') {
      baseData.options = values.options.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
      }));
    } else if (values.type === 'true_false') {
      baseData.correctAnswer = values.correctAnswer;
    } else if (values.type === 'fill_blank') {
      baseData.correctAnswers = values.correctAnswers
        ?.split(',')
        .map((a) => a.trim())
        .filter(Boolean);
    }

    if (question) {
      /** Шинэчлэх */
      updateMutation.mutate(
        { quizId, questionId: question.questionId, data: baseData as UpdateQuestionData },
        {
          onSuccess: () => {
            toast.success(t('questionSaved'));
            onClose();
          },
          onError: (err: Error) => toast.error(err.message),
        },
      );
    } else {
      /** Нэмэх */
      addMutation.mutate(
        { quizId, data: baseData },
        {
          onSuccess: () => {
            toast.success(t('questionSaved'));
            onClose();
          },
          onError: (err: Error) => toast.error(err.message),
        },
      );
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;

  /** Зөв хариулт toggle */
  const setCorrectOption = (index: number) => {
    fields.forEach((_, i) => {
      form.setValue(`options.${i}.isCorrect`, i === index);
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Pencil className="size-5 text-primary" />
        {question ? t('editQuestion') : t('addQuestion')}
      </h3>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Асуултын төрөл */}
        <div>
          <Label>{t('questionType')}</Label>
          <Select
            value={form.watch('type')}
            onValueChange={(v) => form.setValue('type', v as Question['type'])}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">{t('multipleChoice')}</SelectItem>
              <SelectItem value="true_false">{t('trueFalse')}</SelectItem>
              <SelectItem value="fill_blank">{t('fillBlank')}</SelectItem>
              <SelectItem value="essay">{t('essay')}</SelectItem>
              <SelectItem value="code_challenge">{t('codeChallenge')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Асуултын текст */}
        <div>
          <Label>{t('questionText')}</Label>
          <Textarea
            {...form.register('questionText', { required: true })}
            placeholder={t('questionTextPlaceholder')}
            rows={3}
            className="mt-1"
          />
        </div>

        {/* Оноо + Хүндрэл */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t('questionPoints')}</Label>
            <Input
              type="number"
              {...form.register('points', { valueAsNumber: true })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t('questionDifficulty')}</Label>
            <Select
              value={form.watch('difficulty')}
              onValueChange={(v) => form.setValue('difficulty', v as 'easy' | 'medium' | 'hard')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">{t('diffEasy')}</SelectItem>
                <SelectItem value="medium">{t('diffMedium')}</SelectItem>
                <SelectItem value="hard">{t('diffHard')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Төрлөөс хамааран нэмэлт талбар */}
        {questionType === 'multiple_choice' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>{t('answerOptions')}</Label>
              <span className="text-xs text-primary font-bold uppercase">{t('correctAnswer')}</span>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    {...form.register(`options.${index}.text`)}
                    placeholder={t('optionPlaceholder')}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setCorrectOption(index)}
                    className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      form.watch(`options.${index}.isCorrect`)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {form.watch(`options.${index}.isCorrect`) && (
                      <div className="size-2 rounded-full bg-primary-foreground" />
                    )}
                  </button>
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-3.5 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => append({ text: '', isCorrect: false })}
              className="text-sm text-primary font-medium mt-2 flex items-center gap-1 hover:underline"
            >
              <Plus className="size-4" />
              {t('addOption')}
            </button>
          </div>
        )}

        {questionType === 'true_false' && (
          <div>
            <Label>{t('correctAnswer')}</Label>
            <Select
              value={String(form.watch('correctAnswer'))}
              onValueChange={(v) => form.setValue('correctAnswer', v === 'true')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{t('trueOption')}</SelectItem>
                <SelectItem value="false">{t('falseOption')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {questionType === 'fill_blank' && (
          <div>
            <Label>{t('correctAnswer')} (comma separated)</Label>
            <Input
              {...form.register('correctAnswers')}
              placeholder="answer1, answer2..."
              className="mt-1"
            />
          </div>
        )}

        {/* Товчууд */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {t('save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
