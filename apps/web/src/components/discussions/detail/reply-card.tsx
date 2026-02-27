'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check, Pencil, Trash2, ThumbsUp } from 'lucide-react';
import { PostAuthorInfo } from '../post-author-info';
import { cn } from '@/lib/utils';
import type { DiscussionReply } from '@/lib/api-services/discussions.service';

interface ReplyCardProps {
  reply: DiscussionReply;
  isAccepted: boolean;
  isOwner: boolean;
  canAccept: boolean;
  onAccept: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Хариултын карт — accepted highlight, hover edit/delete */
export function ReplyCard({
  reply,
  isAccepted,
  isOwner,
  canAccept,
  onAccept,
  onEdit,
  onDelete,
}: ReplyCardProps) {
  const t = useTranslations('discussions');
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative bg-white dark:bg-slate-900 rounded-xl border overflow-hidden transition-all',
        isAccepted
          ? 'border-2 border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-900/10'
          : 'border-slate-200 dark:border-slate-800',
      )}
    >
      {/* Accepted badge */}
      {isAccepted && (
        <div className="bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 flex items-center gap-2">
          <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {t('acceptedAnswer')}
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Header: зохиогч + hover actions */}
        <div className="flex items-center justify-between mb-3">
          <PostAuthorInfo
            authorName={reply.authorName}
            authorAvatar={reply.authorAvatar}
            createdAt={reply.createdAt}
            badge={reply.isInstructorReply ? t('instructorBadge') : undefined}
            size="md"
          />

          {/* Hover actions */}
          <div
            className={cn(
              'flex items-center gap-1 transition-opacity',
              hovered ? 'opacity-100' : 'opacity-0',
            )}
          >
            {canAccept && !isAccepted && (
              <button
                type="button"
                onClick={onAccept}
                title={t('acceptAnswer')}
                className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <Check className="size-4" />
              </button>
            )}
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={onEdit}
                  title={t('editReply')}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  title={t('deleteReply')}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Контент */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-xl [&_pre]:p-4 [&_code]:text-primary [&_code]:bg-primary/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs [&_pre_code]:bg-transparent [&_pre_code]:p-0"
          dangerouslySetInnerHTML={{ __html: reply.contentHtml || reply.content }}
        />

        {/* Footer */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <ThumbsUp className="size-3.5" />
            <span>{reply.upvotes}</span>
          </div>
          <span className="text-xs text-slate-400">{t('replyToPost')}</span>
        </div>
      </div>
    </motion.div>
  );
}
