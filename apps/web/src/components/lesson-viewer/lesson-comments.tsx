'use client';

import { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLessonComments, useCreateComment } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { LessonCommentItem } from './lesson-comment-item';

interface LessonCommentsProps {
  lessonId: string;
}

/** Сэтгэгдлийн хэсэг — жагсаалт + бичих */
export function LessonComments({ lessonId }: LessonCommentsProps) {
  const t = useTranslations('lessonViewer');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [commentText, setCommentText] = useState('');
  const [sort] = useState<'recent' | 'popular'>('recent');

  const { data, isLoading } = useLessonComments(lessonId, { sort, limit: 50 });
  const createMutation = useCreateComment();

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    createMutation.mutate(
      { lessonId, content: commentText },
      {
        onSuccess: () => setCommentText(''),
      },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('comments')}</h3>
          {data && (
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
              {data.total}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500 font-medium">{t('recentFirst')}</span>
      </div>

      {/* Бичих textarea */}
      {isAuthenticated ? (
        <div className="flex gap-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('addComment')}
            rows={2}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A93E5]/40 resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !commentText.trim()}
            className="self-end px-4 py-2.5 bg-[#8A93E5] text-white text-sm font-medium rounded-xl hover:bg-[#7B84D6] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t('posting')}
              </>
            ) : (
              t('postComment')
            )}
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 italic">{t('loginToComment')}</p>
      )}

      {/* Жагсаалт */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.comments?.length ? (
        <div className="flex flex-col gap-4">
          {data.comments.map((comment) => (
            <LessonCommentItem key={comment.id} comment={comment} lessonId={lessonId} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
            <MessageCircle className="size-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('noComments')}</p>
        </div>
      )}
    </div>
  );
}
