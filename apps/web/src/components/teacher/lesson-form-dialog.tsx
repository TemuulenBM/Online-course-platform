'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Lesson, LessonType } from '@ocp/shared-types';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const lessonSchema = z.object({
  title: z.string().min(1, 'Нэр оруулна уу').max(300),
  lessonType: z.enum(['video', 'text', 'quiz', 'assignment', 'live']),
  durationMinutes: z.coerce.number().int().min(0).optional().or(z.literal('')),
  isPreview: z.boolean().optional(),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

const LESSON_TYPES: { value: LessonType; labelKey: string }[] = [
  { value: 'video', labelKey: 'video' },
  { value: 'text', labelKey: 'text' },
  { value: 'quiz', labelKey: 'quiz' },
  { value: 'assignment', labelKey: 'assignment' },
  { value: 'live', labelKey: 'live' },
];

interface LessonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: Lesson | null;
  onSubmit: (data: {
    title: string;
    lessonType: LessonType;
    durationMinutes?: number;
    isPreview?: boolean;
  }) => void;
  isPending: boolean;
}

export function LessonFormDialog({
  open,
  onOpenChange,
  lesson,
  onSubmit,
  isPending,
}: LessonFormDialogProps) {
  const t = useTranslations('teacher');
  const isEditing = !!lesson;

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: '',
      lessonType: 'video',
      durationMinutes: '',
      isPreview: false,
    },
  });

  useEffect(() => {
    if (lesson) {
      form.reset({
        title: lesson.title,
        lessonType: lesson.lessonType,
        durationMinutes: lesson.durationMinutes || '',
        isPreview: lesson.isPreview,
      });
    } else {
      form.reset({
        title: '',
        lessonType: 'video',
        durationMinutes: '',
        isPreview: false,
      });
    }
  }, [lesson, form]);

  const handleSubmit = (values: LessonFormValues) => {
    onSubmit({
      title: values.title,
      lessonType: values.lessonType as LessonType,
      durationMinutes: values.durationMinutes === '' ? undefined : Number(values.durationMinutes),
      isPreview: values.isPreview,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editLesson') : t('createLesson')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Нэр */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lessonTitle')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('lessonTitlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Төрөл — create үед зөвхөн */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="lessonType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lessonType')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectLessonType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LESSON_TYPES.map((lt) => (
                          <SelectItem key={lt.value} value={lt.value}>
                            {t(lt.labelKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Хугацаа */}
            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('duration')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder={t('durationPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            <FormField
              control={form.control}
              name="isPreview"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">{t('isPreview')}</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('backToCourses') ? undefined : undefined}
                Цуцлах
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEditing
                    ? t('saving')
                    : t('creating')
                  : isEditing
                    ? t('editLesson')
                    : t('createLesson')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
