'use client';

import { useTranslations } from 'next-intl';
import { Eye, Share2, MoreHorizontal } from 'lucide-react';
import { PostAuthorInfo } from '../post-author-info';
import { ModerationToolbar } from '../moderation-toolbar';
import type { DiscussionPost } from '@/lib/api-services/discussions.service';

interface PostDetailCardProps {
  post: DiscussionPost;
  /** TEACHER/ADMIN эсэхийг шалгах */
  showModeration: boolean;
  onPin: () => void;
  onLock: () => void;
  onFlag: () => void;
}

/** Нийтлэлийн дэлгэрэнгүй бичлэг — tag, гарчиг, зохиогч, контент, moderation */
export function PostDetailCard({
  post,
  showModeration,
  onPin,
  onLock,
  onFlag,
}: PostDetailCardProps) {
  const t = useTranslations('discussions');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 md:p-8">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Гарчиг */}
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
          {post.title || t('untitledPost')}
        </h1>

        {/* Зохиогч + views */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <PostAuthorInfo
            authorName={post.authorName}
            authorAvatar={post.authorAvatar}
            createdAt={post.createdAt}
            size="md"
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Eye className="size-3.5" />
            <span>
              {post.viewsCount} {t('views')}
            </span>
          </div>
        </div>

        {/* Moderation toolbar */}
        {showModeration && (
          <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <ModerationToolbar
              isPinned={post.isPinned}
              isLocked={post.isLocked}
              isFlagged={post.isFlagged}
              onPin={onPin}
              onLock={onLock}
              onFlag={onFlag}
            />
          </div>
        )}

        {/* Контент */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:text-primary [&_code]:bg-primary/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs [&_pre_code]:bg-transparent [&_pre_code]:p-0"
          dangerouslySetInnerHTML={{ __html: post.contentHtml || post.content }}
        />

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>
              {post.replies?.length || 0} {t('replyCount')}
            </span>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              className="flex items-center gap-1 hover:text-primary transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
            >
              <Share2 className="size-3.5" />
              {t('share')}
            </button>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
