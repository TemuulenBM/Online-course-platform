'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Category } from '@ocp/shared-types';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Ангиллын нэр оруулна уу'),
  parentId: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.coerce.number().min(0).optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  categories: Category[];
  editingCategory?: Category | null;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

/** Ангилал нэмэх/засах форм */
export function CategoryForm({
  categories,
  editingCategory,
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) {
  const t = useTranslations('admin');
  const isEditing = !!editingCategory;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      parentId: '',
      description: '',
      displayOrder: 0,
    },
  });

  /** Засах горимд form-г бөглөх */
  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        parentId: editingCategory.parentId || '',
        description: editingCategory.description || '',
        displayOrder: editingCategory.displayOrder,
      });
    } else {
      reset({ name: '', parentId: '', description: '', displayOrder: 0 });
    }
  }, [editingCategory, reset]);

  /** Эцэг ангилалуудын жагсаалт — зөвхөн root level */
  const parentOptions = categories.filter((c) => !c.parentId && c.id !== editingCategory?.id);

  const handleFormSubmit = (values: CategoryFormValues) => {
    onSubmit({
      ...values,
      parentId: values.parentId || undefined,
    });
  };

  return (
    <div
      className="bg-white dark:bg-slate-900/30 rounded-2xl border border-primary/10 p-6 md:p-8 shadow-sm"
      id="add-category"
    >
      {/* Гарчиг */}
      <div className="flex items-center gap-3 mb-8">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {isEditing ? <Pencil className="size-5" /> : <PlusCircle className="size-5" />}
        </div>
        <h3 className="text-xl font-bold">
          {isEditing ? t('editCategoryTitle') : t('addCategoryTitle')}
        </h3>
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Ангиллын нэр */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t('categoryName')}
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-primary/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder={t('categoryNamePlaceholder')}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Эцэг ангилал */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t('parentCategory')}
          </label>
          <select
            {...register('parentId')}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-primary/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="">{t('noParentCategory')}</option>
            {parentOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Тайлбар */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t('categoryDescription')}
          </label>
          <textarea
            {...register('description')}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-primary/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder={t('categoryDescriptionPlaceholder')}
            rows={3}
          />
        </div>

        {/* Дараалал */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t('categoryOrder')}
          </label>
          <input
            type="number"
            {...register('displayOrder')}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-primary/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder="1"
          />
        </div>

        {/* Товчнууд */}
        <div className="flex items-end gap-3">
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {t('cancelEdit')}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
          >
            {isLoading ? t('saving') : isEditing ? t('updateCategory') : t('saveCategory')}
          </button>
        </div>
      </form>
    </div>
  );
}
