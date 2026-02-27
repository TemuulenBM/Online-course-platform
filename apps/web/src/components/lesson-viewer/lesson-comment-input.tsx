'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';
import { getFileUrl } from '@/lib/utils';

interface LessonCommentInputProps {
  onSubmit: (content: string, timestampSeconds?: number) => void;
  isPending: boolean;
}

/** Сэтгэгдэл бичих input — avatar + textarea + timestamp + submit */
export function LessonCommentInput({ onSubmit, isPending }: LessonCommentInputProps) {
  const t = useTranslations('discussions');
  const user = useAuthStore((s) => s.user);

  const [content, setContent] = useState('');
  const [timestamp, setTimestamp] = useState('');

  /** Timestamp-ийг секунд руу хөрвүүлэх (MM:SS → seconds) */
  const parseTimestamp = (val: string): number | undefined => {
    if (!val.trim()) return undefined;
    const parts = val.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      return mins * 60 + secs;
    }
    return undefined;
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim(), parseTimestamp(timestamp));
    setContent('');
    setTimestamp('');
  };

  const initial = user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={getFileUrl(undefined)} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-sm font-bold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('commentPlaceholder')}
            rows={3}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Timestamp input */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5">
                <Clock className="size-3.5 text-primary" />
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="02:30 (Цаг)"
                  className="bg-transparent text-xs text-slate-600 dark:text-slate-400 placeholder:text-slate-400 focus:outline-none w-24"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !content.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {t('commentSubmit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
