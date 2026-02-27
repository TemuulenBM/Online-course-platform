'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';

const lessonSchema = z.object({
  title: z.string().min(1, 'Нэр оруулна уу').max(300),
  lessonType: z.enum(['video', 'text', 'quiz', 'assignment', 'live']),
  durationMinutes: z.coerce.number().int().min(0).optional().or(z.literal('')),
  isPreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
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
    isPublished?: boolean;
  }) => void;
  isPending: boolean;
  courseName?: string;
}

/** Хичээл үүсгэх/засах маягт — dialog */
export function LessonFormDialog({
  open,
  onOpenChange,
  lesson,
  onSubmit,
  isPending,
  courseName,
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
      isPublished: false,
    },
  });

  useEffect(() => {
    if (lesson) {
      form.reset({
        title: lesson.title,
        lessonType: lesson.lessonType,
        durationMinutes: lesson.durationMinutes || '',
        isPreview: lesson.isPreview,
        isPublished: lesson.isPublished,
      });
    } else {
      form.reset({
        title: '',
        lessonType: 'video',
        durationMinutes: '',
        isPreview: false,
        isPublished: false,
      });
    }
  }, [lesson, form]);

  const handleSubmit = (values: LessonFormValues) => {
    onSubmit({
      title: values.title,
      lessonType: values.lessonType as LessonType,
      durationMinutes: values.durationMinutes === '' ? undefined : Number(values.durationMinutes),
      isPreview: values.isPreview,
      isPublished: values.isPublished,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? t('editLesson') : t('createLesson')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Курс (read-only) */}
            {courseName && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('courseLabel')}
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-primary font-medium">
                  <BookOpen className="size-4 flex-shrink-0" />
                  <span className="truncate">{courseName}</span>
                </div>
              </div>
            )}

            {/* Гарчиг */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">{t('lessonTitle')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('lessonTitlePlaceholder')}
                      className="px-4 py-3 rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Төрөл + Хугацаа — grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Төрөл */}
              <FormField
                control={form.control}
                name="lessonType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">{t('lessonType')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                      <FormControl>
                        <SelectTrigger className="px-4 py-3 rounded-lg">
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

              {/* Хугацаа */}
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">{t('duration')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          className="px-4 py-3 pr-12 rounded-lg"
                          {...field}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                          мин
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Toggles хэсэг */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
              {/* Preview toggle */}
              <FormField
                control={form.control}
                name="isPreview"
                render={({ field }) => (
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('freePreview')}
                      </span>
                      <span className="text-xs text-slate-500">{t('freePreviewDesc')}</span>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />

              {/* Publish toggle */}
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('publishToggle')}
                      </span>
                      <span className="text-xs text-slate-500">{t('publishToggleDesc')}</span>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full md:w-auto px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="w-full md:w-auto px-10 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
              >
                {isPending
                  ? isEditing
                    ? t('saving')
                    : t('creating')
                  : isEditing
                    ? t('editLesson')
                    : t('createLesson')}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
