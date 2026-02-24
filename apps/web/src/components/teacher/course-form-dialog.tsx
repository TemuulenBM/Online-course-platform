'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Course, Category } from '@ocp/shared-types';

import { useCategoryTree } from '@/hooks/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const courseSchema = z.object({
  title: z.string().min(1, 'Нэр оруулна уу').max(200),
  description: z.string().min(1, 'Тайлбар оруулна уу'),
  categoryId: z.string().min(1, 'Ангилал сонгоно уу'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  price: z.coerce.number().min(0).optional().or(z.literal('')),
  discountPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  language: z.string().min(1),
  tags: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

const DIFFICULTIES = [
  { value: 'beginner', labelKey: 'diffBeginner' },
  { value: 'intermediate', labelKey: 'diffIntermediate' },
  { value: 'advanced', labelKey: 'diffAdvanced' },
] as const;

const LANGUAGES = [
  { value: 'mn', label: 'Монгол' },
  { value: 'en', label: 'English' },
] as const;

/** Ангиллын модыг хавтгай жагсаалт болгох */
function flattenCategories(categories: Category[], depth = 0): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  for (const cat of categories) {
    const prefix = depth > 0 ? '— '.repeat(depth) : '';
    result.push({ id: cat.id, label: `${prefix}${cat.name}` });
    if (cat.children?.length) {
      result.push(...flattenCategories(cat.children, depth + 1));
    }
  }
  return result;
}

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSubmit: (data: {
    title: string;
    description: string;
    categoryId: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    price?: number;
    discountPrice?: number;
    language?: string;
    tags?: string[];
  }) => void;
  isPending: boolean;
}

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
  onSubmit,
  isPending,
}: CourseFormDialogProps) {
  const t = useTranslations('teacher');
  const isEditing = !!course;
  const { data: categoryTree } = useCategoryTree();

  const flatCategories = categoryTree ? flattenCategories(categoryTree) : [];

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      difficulty: 'beginner',
      price: '',
      discountPrice: '',
      language: 'mn',
      tags: '',
    },
  });

  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description,
        categoryId: course.categoryId || '',
        difficulty: course.difficulty || 'beginner',
        price: course.price ?? '',
        discountPrice: course.discountPrice ?? '',
        language: course.language || 'mn',
        tags: course.tags?.join(', ') || '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        categoryId: '',
        difficulty: 'beginner',
        price: '',
        discountPrice: '',
        language: 'mn',
        tags: '',
      });
    }
  }, [course, form]);

  const handleSubmit = (values: CourseFormValues) => {
    const tags = values.tags
      ? values.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    onSubmit({
      title: values.title,
      description: values.description,
      categoryId: values.categoryId,
      difficulty: values.difficulty,
      price: values.price === '' ? undefined : Number(values.price),
      discountPrice: values.discountPrice === '' ? undefined : Number(values.discountPrice),
      language: values.language,
      tags,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editCourse') : t('createCourse')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Нэр */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courseTitle')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('courseTitlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Тайлбар */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courseDescription')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('courseDescriptionPlaceholder')} rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ангилал + Түвшин */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('courseCategory')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectCategory')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {flatCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('courseDifficulty')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectDifficulty')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTIES.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {t(d.labelKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Үнэ + Хямдралтай үнэ */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('coursePrice')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder={t('coursePricePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <FormField
                  control={form.control}
                  name="discountPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('courseDiscountPrice')}</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Хэл */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courseLanguage')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Таг */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courseTags')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('courseTagsPlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('courseTagsHelp')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEditing
                    ? t('saving')
                    : t('creating')
                  : isEditing
                    ? t('editCourse')
                    : t('createCourse')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
