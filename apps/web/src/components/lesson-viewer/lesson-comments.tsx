'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useLessonComments, useCreateComment, useDeleteComment } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { DiscussionPagination } from '@/components/discussions/discussion-pagination';
import { ConfirmDeleteDialog } from '@/components/discussions/confirm-delete-dialog';
import { LessonCommentsHeader } from './lesson-comments-header';
import { LessonCommentInput } from './lesson-comment-input';
import { LessonCommentItem } from './lesson-comment-item';
import type { CommentsListParams } from '@/lib/api-services/comments.service';

interface LessonCommentsProps {
  lessonId: string;
  /** Видео timestamp-д очих callback (optional) */
  onSeekTo?: (seconds: number) => void;
}

/** Хичээлийн сэтгэгдлийн хэсэг — бүрэн дахин бичсэн (Дизайн 3) */
export function LessonComments({ lessonId, onSeekTo }: LessonCommentsProps) {
  const t = useTranslations('discussions');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState(1);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  const params: CommentsListParams = {
    page,
    limit: 20,
    sortBy: sortBy as 'newest' | 'upvotes' | 'timestamp',
  };

  const { data, isLoading } = useLessonComments(lessonId, params);
  const createMutation = useCreateComment();
  const deleteMutation = useDeleteComment(lessonId);

  /** Сэтгэгдэл бичих */
  const handleSubmit = (content: string, timestampSeconds?: number) => {
    createMutation.mutate(
      { lessonId, content, timestampSeconds },
      {
        onSuccess: () => {
          setPage(1);
        },
      },
    );
  };

  /** Сэтгэгдэл устгах */
  const handleDelete = () => {
    if (!deleteCommentId) return;
    deleteMutation.mutate(deleteCommentId, {
      onSuccess: () => setDeleteCommentId(null),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <LessonCommentsHeader
        total={data?.total || 0}
        sortBy={sortBy}
        onSortChange={(val) => {
          setSortBy(val);
          setPage(1);
        }}
      />

      {/* Сэтгэгдэл бичих input */}
      {isAuthenticated ? (
        <LessonCommentInput onSubmit={handleSubmit} isPending={createMutation.isPending} />
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">
          {t('loginToComment')}
        </p>
      )}

      {/* Жагсаалт */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.comments?.length ? (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.03 } },
          }}
          className="space-y-5"
        >
          {data.comments.map((comment) => (
            <LessonCommentItem
              key={comment.id}
              comment={comment}
              lessonId={lessonId}
              onSeekTo={onSeekTo}
              onDelete={(id) => setDeleteCommentId(id)}
            />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
            <MessageCircle className="size-7 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('noComments')}</p>
        </div>
      )}

      {/* Pagination */}
      {data && (
        <DiscussionPagination
          page={data.page}
          total={data.total}
          limit={data.limit}
          onPageChange={setPage}
        />
      )}

      {/* Устгах dialog */}
      <ConfirmDeleteDialog
        open={!!deleteCommentId}
        onOpenChange={(open) => !open && setDeleteCommentId(null)}
        title={t('deleteCommentTitle')}
        description={t('deleteCommentDescription')}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
