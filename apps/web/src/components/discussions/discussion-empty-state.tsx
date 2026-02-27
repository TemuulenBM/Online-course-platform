'use client';

import { MessageCircle } from 'lucide-react';

interface DiscussionEmptyStateProps {
  title: string;
  description?: string;
}

/** Хоосон state — нийтлэл/сэтгэгдэл байхгүй үед */
export function DiscussionEmptyState({ title, description }: DiscussionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <MessageCircle className="size-8 text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm">{description}</p>}
    </div>
  );
}
