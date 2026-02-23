'use client';

import { useState } from 'react';
import { ThumbsUp, MessageCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LessonComment } from '@/lib/api-services/comments.service';
import { useReplyComment, useUpvoteComment } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';

interface LessonCommentItemProps {
  comment: LessonComment;
  lessonId: string;
  depth?: number;
}

/** Нэг сэтгэгдэл — reply + upvote + nested replies */
export function LessonCommentItem({ comment, lessonId, depth = 0 }: LessonCommentItemProps) {
  const t = useTranslations('lessonViewer');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const replyMutation = useReplyComment(lessonId);
  const upvoteMutation = useUpvoteComment(lessonId);

  const handleReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate(
      { commentId: comment.id, content: replyText },
      {
        onSuccess: () => {
          setReplyText('');
          setShowReply(false);
        },
      },
    );
  };

  /** Хугацааг харьцангуй текст болгох */
  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className={depth > 0 ? 'ml-10 mt-3' : ''}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8A93E5] to-[#A78BFA] flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-white">
            {comment.authorName?.charAt(0).toUpperCase() || '?'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Нэр + хугацаа */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {comment.authorName || 'User'}
            </span>
            <span className="text-xs text-slate-400">{formatTimeAgo(comment.createdAt)}</span>
          </div>

          {/* Текст */}
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{comment.content}</p>

          {/* Үйлдлүүд */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => isAuthenticated && upvoteMutation.mutate(comment.id)}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1 text-xs transition-colors ${
                comment.hasUpvoted
                  ? 'text-[#8A93E5] font-medium'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              } disabled:opacity-50`}
            >
              <ThumbsUp className="size-3.5" />
              {comment.upvoteCount > 0 && <span>{comment.upvoteCount}</span>}
            </button>

            {isAuthenticated && depth < 2 && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <MessageCircle className="size-3.5" />
                {t('reply')}
              </button>
            )}
          </div>

          {/* Reply textarea */}
          {showReply && (
            <div className="mt-3 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t('addComment')}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A93E5]/40"
              />
              <button
                onClick={handleReply}
                disabled={replyMutation.isPending || !replyText.trim()}
                className="px-3 py-2 bg-[#8A93E5] text-white text-xs font-medium rounded-lg hover:bg-[#7B84D6] transition-colors disabled:opacity-50"
              >
                {replyMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  t('reply')
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies?.map((reply) => (
        <LessonCommentItem key={reply.id} comment={reply} lessonId={lessonId} depth={depth + 1} />
      ))}
    </div>
  );
}
