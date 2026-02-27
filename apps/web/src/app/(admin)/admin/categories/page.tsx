'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { Category } from '@ocp/shared-types';
import {
  useCategoryTree,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/api';
import { CategoryTable } from '@/components/admin/category-table';
import { CategoryForm, type CategoryFormValues } from '@/components/admin/category-form';

export default function AdminCategoriesPage() {
  const t = useTranslations('admin');
  const { data: categories = [] } = useCategoryTree();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  /** Ангилал нэмэх / засах */
  const handleSubmit = (values: CategoryFormValues) => {
    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, data: values },
        {
          onSuccess: () => {
            toast.success(t('categoryUpdated'));
            setEditingCategory(null);
          },
          onError: () => toast.error(t('categoryUpdateError')),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success(t('categoryCreated'));
        },
        onError: () => toast.error(t('categoryCreateError')),
      });
    }
  };

  /** Ангилал устгах */
  const handleDelete = (category: Category) => {
    if (!confirm(t('deleteCategoryConfirm', { name: category.name }))) return;
    deleteMutation.mutate(category.id, {
      onSuccess: () => toast.success(t('categoryDeleted')),
      onError: () => toast.error(t('categoryDeleteError')),
    });
  };

  /** Засах горим */
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    document.getElementById('add-category')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">{t('categoryManagement')}</h2>
            <p className="text-slate-500 mt-1">{t('categoryManagementDesc')}</p>
          </div>
          <a
            href="#add-category"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 w-fit"
          >
            <Plus className="size-5" />
            <span>{t('addCategory')}</span>
          </a>
        </div>

        {/* Хүснэгт */}
        <CategoryTable categories={categories} onEdit={handleEdit} onDelete={handleDelete} />

        {/* Нэмэх / Засах форм */}
        <CategoryForm
          categories={categories}
          editingCategory={editingCategory}
          onSubmit={handleSubmit}
          onCancel={() => setEditingCategory(null)}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}
