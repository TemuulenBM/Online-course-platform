'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ThumbsUp, MessageCircle, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useReplyComment, useUpvoteComment, useUpdateComment } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { getFileUrl, cn } from '@/lib/utils';
import { formatTimeAgo } from '@/components/discussions/post-author-info';
import type { LessonComment } from '@/lib/api-services/comments.service';

interface LessonCommentItemProps {
  comment: LessonComment;
  lessonId: string;
  depth?: number;
  onSeekTo?: (seconds: number) => void;
  onDelete?: (commentId: string) => void;
}

/** Нэг сэтгэгдэл — reply + upvote + nested replies + timestamp click + edit/delete */
export function LessonCommentItem({
  comment,
  lessonId,
  depth = 0,
  onSeekTo,
  onDelete,
}: LessonCommentItemProps) {
  const t = useTranslations('discussions');
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [hovered, setHovered] = useState(false);

  const replyMutation = useReplyComment(lessonId);
  const upvoteMutation = useUpvoteComment(lessonId);
  const updateMutation = useUpdateComment(lessonId);

  const isOwner = user?.id === comment.userId;
  const initial = comment.authorName?.charAt(0).toUpperCase() || '?';

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

  const handleEdit = () => {
    if (!editText.trim()) return;
    updateMutation.mutate(
      { commentId: comment.id, content: editText },
      {
        onSuccess: () => setEditing(false),
      },
    );
  };

  /** Timestamp-ийг MM:SS формат руу хөрвүүлэх */
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  /** Content-д байгаа timestamp-уудыг clickable болгох */
  const renderContent = (text: string) => {
    if (!comment.timestampSeconds && comment.timestampSeconds !== 0) {
      return <span>{text}</span>;
    }
    return (
      <span>
        {text}
        {comment.timestampSeconds !== undefined && (
          <>
            {' '}
            <button
              type="button"
              onClick={() => onSeekTo?.(comment.timestampSeconds!)}
              className="inline-flex items-center bg-primary/10 text-primary font-semibold text-xs px-2 py-0.5 rounded-md hover:bg-primary/20 transition-colors"
            >
              {formatTimestamp(comment.timestampSeconds)}
            </button>
          </>
        )}
      </span>
    );
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(depth > 0 && 'ml-12 pl-4 border-l-2 border-slate-200 dark:border-slate-700')}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className={cn(depth > 0 ? 'size-8' : 'size-10', 'shrink-0')}>
          <AvatarImage src={getFileUrl(comment.authorAvatar)} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-xs font-bold">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Нэр + хугацаа + badge + hover actions */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {comment.authorName || 'User'}
            </span>
            {comment.isInstructorReply && (
              <Badge className="bg-primary text-white border-0 text-[10px] font-bold px-1.5 py-0">
                {t('instructorBadge')}
              </Badge>
            )}
            <span className="text-xs text-slate-400">{formatTimeAgo(comment.createdAt)}</span>

            {/* Hover edit/delete */}
            {isOwner && (
              <div
                className={cn(
                  'flex items-center gap-0.5 ml-auto transition-opacity',
                  hovered ? 'opacity-100' : 'opacity-0',
                )}
              >
                <button
                  type="button"
                  onClick={() => setEditing(!editing)}
                  className="p-1 rounded text-slate-400 hover:text-primary transition-colors"
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(comment.id)}
                  className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            )}
          </div>

          {/* Контент эсвэл edit mode */}
          {editing ? (
            <div className="space-y-2 mb-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={updateMutation.isPending}
                  className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-lg disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    t('commentSave')
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditText(comment.content);
                  }}
                  className="px-3 py-1 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('commentCancel')}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {renderContent(comment.content)}
            </p>
          )}

          {/* Үйлдлүүд */}
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={() => isAuthenticated && upvoteMutation.mutate(comment.id)}
              disabled={!isAuthenticated}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors',
                comment.hasUpvoted
                  ? 'text-primary font-semibold'
                  : 'text-slate-400 hover:text-primary',
                'disabled:opacity-50',
              )}
            >
              <ThumbsUp className="size-3.5" />
              {comment.upvoteCount > 0 && <span>{comment.upvoteCount}</span>}
            </button>

            {isAuthenticated && depth < 2 && (
              <button
                type="button"
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors"
              >
                <MessageCircle className="size-3.5" />
                {t('replyAction')}
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReply && (
            <div className="mt-3 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t('replyPlaceholder')}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
              />
              <button
                type="button"
                onClick={handleReply}
                disabled={replyMutation.isPending || !replyText.trim()}
                className="px-3 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {replyMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  t('replyAction')
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies?.map((reply) => (
        <LessonCommentItem
          key={reply.id}
          comment={reply}
          lessonId={lessonId}
          depth={depth + 1}
          onSeekTo={onSeekTo}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
}
