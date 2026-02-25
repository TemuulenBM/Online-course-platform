'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText, ImageIcon, Settings, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { Course } from '@ocp/shared-types';

import { useCategoryTree, useCreateCourse, useUpdateCourse } from '@/hooks/api';
import { courseFormSchema, type CourseFormValues } from './course-form-schema';
import { ROUTES } from '@/lib/constants';

interface CourseFormPageProps {
  course?: Course;
}

/** Сургалт үүсгэх/засах форм хуудас — шинэ дизайн */
export function CourseFormPage({ course }: CourseFormPageProps) {
  const router = useRouter();
  const t = useTranslations('teacher');
  const tc = useTranslations('common');
  const isEditing = !!course;

  const { data: categories } = useCategoryTree();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title || '',
      description: course?.description || '',
      categoryId: course?.categoryId || '',
      difficulty: course?.difficulty || 'beginner',
      price: course?.price || 0,
      discountPrice: course?.discountPrice || 0,
      language: course?.language || 'mn',
      tags: course?.tags?.join(', ') || '',
      thumbnailUrl: course?.thumbnailUrl || '',
    },
  });

  const thumbnailUrl = watch('thumbnailUrl');

  const onSubmit = (data: CourseFormValues) => {
    const payload = {
      ...data,
      tags: data.tags
        ? data.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    };

    if (isEditing && course) {
      updateMutation.mutate(
        { id: course.id, data: payload },
        {
          onSuccess: () => {
            toast.success(t('courseUpdated'));
            router.push(ROUTES.TEACHER_COURSES);
          },
          onError: () => toast.error(tc('error')),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (newCourse) => {
          toast.success(t('courseCreated'));
          router.push(ROUTES.TEACHER_CURRICULUM(newCourse.id));
        },
        onError: () => toast.error(tc('error')),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const inputClass =
    'w-full bg-background dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none';

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={ROUTES.TEACHER_COURSES}
            className="flex items-center gap-2 text-primary mb-1 hover:opacity-80"
          >
            <ArrowLeft className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t('backToCourses')}
            </span>
          </Link>
          <h2 className="text-3xl font-black tracking-tight">
            {isEditing ? t('editCourse') : t('createCourse')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">{t('courseFormSubtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={ROUTES.TEACHER_COURSES}
            className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
          >
            {tc('cancel')}
          </Link>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="px-8 py-2.5 rounded-xl text-white font-bold text-sm bg-primary shadow-lg shadow-primary/30 hover:opacity-90 transition-all disabled:opacity-70"
          >
            {isPending ? t('saving') : tc('save')}
          </button>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-5xl mx-auto">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Зүүн багана — Үндсэн мэдээлэл + Үнэ */}
          <div className="md:col-span-2 space-y-6">
            {/* Үндсэн мэдээлэл */}
            <section className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                {t('basicInfo')}
              </h3>
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t('courseTitle')}
                  </label>
                  <input
                    {...register('title')}
                    className={inputClass}
                    placeholder={t('courseTitlePlaceholder')}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t('courseDescription')}
                  </label>
                  <textarea
                    {...register('description')}
                    className={`${inputClass} resize-none`}
                    placeholder={t('courseDescriptionPlaceholder')}
                    rows={6}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Үнэ ба Шошго */}
            <section className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Tag className="size-5 text-primary" />
                {t('priceAndTags')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t('coursePrice')} (₮)
                  </label>
                  <input
                    {...register('price')}
                    type="number"
                    className={inputClass}
                    placeholder={t('coursePricePlaceholder')}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t('courseDiscountPrice')} (₮)
                  </label>
                  <input
                    {...register('discountPrice')}
                    type="number"
                    className={inputClass}
                    placeholder={t('coursePricePlaceholder')}
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t('courseTags')}
                  </label>
                  <input
                    {...register('tags')}
                    className={inputClass}
                    placeholder={t('courseTagsPlaceholder')}
                  />
                  <p className="text-xs text-slate-400">{t('courseTagsHelp')}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Баруун багана — Тохиргоо + Зураг */}
          <div className="space-y-6">
            {/* Тохиргоо */}
            <section className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Settings className="size-5 text-primary" />
                {t('settingsSection')}
              </h3>
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t('courseCategory')}
                  </label>
                  <select {...register('categoryId')} className={`${inputClass} cursor-pointer`}>
                    <option value="">{t('selectCategory')}</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    {categories?.flatMap((cat) =>
                      (cat.children ?? []).map((child) => (
                        <option key={child.id} value={child.id}>
                          &nbsp;&nbsp;{child.name}
                        </option>
                      )),
                    )}
                  </select>
                  {errors.categoryId && (
                    <p className="text-xs text-red-500">{errors.categoryId.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t('courseDifficulty')}
                  </label>
                  <select {...register('difficulty')} className={`${inputClass} cursor-pointer`}>
                    <option value="beginner">{t('diffBeginner')}</option>
                    <option value="intermediate">{t('diffIntermediate')}</option>
                    <option value="advanced">{t('diffAdvanced')}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t('courseLanguage')}
                  </label>
                  <select {...register('language')} className={`${inputClass} cursor-pointer`}>
                    <option value="mn">Монгол</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Зураг */}
            <section className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <ImageIcon className="size-5 text-primary" />
                {t('imageSection')}
              </h3>
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-primary/20 overflow-hidden">
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt="Preview"
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="size-10 text-primary mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">
                        {t('thumbnailUploadHint')}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t('courseThumbnailUrl')}
                  </label>
                  <input
                    {...register('thumbnailUrl')}
                    className={inputClass}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
