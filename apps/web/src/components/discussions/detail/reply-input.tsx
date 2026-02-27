'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiscussionRichEditor } from '../discussion-rich-editor';

interface ReplyInputProps {
  onSubmit: (content: string, contentHtml: string) => void;
  isPending: boolean;
  isLocked?: boolean;
}

/** Хариулт бичих input — Tiptap mini editor */
export function ReplyInput({ onSubmit, isPending, isLocked }: ReplyInputProps) {
  const t = useTranslations('discussions');
  const [contentHtml, setContentHtml] = useState('');
  const [contentText, setContentText] = useState('');

  const handleSubmit = () => {
    if (!contentText.trim()) return;
    onSubmit(contentText, contentHtml);
    setContentHtml('');
    setContentText('');
  };

  if (isLocked) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-center">
        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">{t('postLocked')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('replyTitle')}</h3>
      <DiscussionRichEditor
        content={contentHtml}
        onChange={(html, text) => {
          setContentHtml(html);
          setContentText(text);
        }}
        placeholder={t('replyPlaceholder')}
        minHeight="120px"
      />
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!contentText.trim() || isPending}
          className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 shadow-md shadow-primary/20"
        >
          {isPending ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Send className="size-4 mr-2" />
          )}
          {t('replySubmit')}
        </Button>
      </div>
    </div>
  );
}
