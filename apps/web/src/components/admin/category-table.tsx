'use client';

import { ChevronDown, CornerDownRight, Pencil, Trash2, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Category } from '@ocp/shared-types';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

/** Ангиллын хүснэгт — parent/child hierarchy */
export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  const t = useTranslations('admin');

  return (
    <div className="bg-white dark:bg-slate-900/30 rounded-xl border border-primary/10 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/5 border-b border-primary/10">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('categoryName')}
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('categoryDescription')}
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                {t('categoryCourseCount')}
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                {t('categoryOrder')}
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
                t={t}
              />
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  {t('noCategories')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Нэг ангиллын мөр — хүүхэд ангиллуудтай */
function CategoryRow({
  category,
  onEdit,
  onDelete,
  t,
  isChild = false,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  t: ReturnType<typeof useTranslations>;
  isChild?: boolean;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const hasCourses = (category.coursesCount ?? 0) > 0;

  return (
    <>
      <tr
        className={`hover:bg-primary/5 transition-colors ${isChild ? 'bg-slate-50/50 dark:bg-slate-900/10' : ''}`}
      >
        {/* Нэр */}
        <td className={`px-6 py-4 ${isChild ? 'pl-12' : ''}`}>
          <div className="flex items-center gap-3">
            {isChild ? (
              <CornerDownRight className="size-4 text-slate-400" />
            ) : hasChildren ? (
              <ChevronDown className="size-5 text-primary/60" />
            ) : (
              <Layers className="size-5 text-primary/60" />
            )}
            <span className={isChild ? 'text-sm font-medium' : 'font-semibold'}>
              {category.name}
            </span>
          </div>
        </td>

        {/* Тайлбар */}
        <td
          className={`px-6 py-4 text-sm ${isChild ? 'text-slate-400 italic' : 'text-slate-500'}`}
        >
          {category.description || '-'}
        </td>

        {/* Курсийн тоо */}
        <td className="px-6 py-4 text-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              hasCourses
                ? 'bg-primary/10 text-primary'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            {category.coursesCount ?? 0}
          </span>
        </td>

        {/* Дараалал */}
        <td className="px-6 py-4 text-center text-sm font-medium">{category.displayOrder}</td>

        {/* Үйлдэл */}
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onEdit(category)}
              className="p-2 text-slate-400 hover:text-primary transition-colors"
              title={t('editCategory')}
            >
              <Pencil className="size-4" />
            </button>
            {hasCourses ? (
              <button
                type="button"
                disabled
                className="p-2 text-slate-300 cursor-not-allowed"
                title={t('cannotDeleteCategory')}
              >
                <Trash2 className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onDelete(category)}
                className="p-2 text-red-400 hover:text-red-600 transition-colors"
                title={t('deleteCategory')}
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Хүүхэд ангиллууд */}
      {hasChildren &&
        category.children!.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            onEdit={onEdit}
            onDelete={onDelete}
            t={t}
            isChild
          />
        ))}
    </>
  );
}
