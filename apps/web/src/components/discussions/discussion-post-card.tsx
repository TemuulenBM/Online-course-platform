'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ThumbsUp, MessageCircle, Eye, Pin, HelpCircle, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PostAuthorInfo } from './post-author-info';
import { cn } from '@/lib/utils';
import type { DiscussionPostListItem } from '@/lib/api-services/discussions.service';

interface DiscussionPostCardProps {
  post: DiscussionPostListItem;
  href: string;
}

/** Форум жагсаалтын нийтлэл карт */
export function DiscussionPostCard({ post, href }: DiscussionPostCardProps) {
  const t = useTranslations('discussions');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={href} className="block group">
        <div
          className={cn(
            'relative bg-white dark:bg-slate-900 rounded-xl border transition-all hover:shadow-md hover:border-primary/20',
            post.isPinned
              ? 'border-l-[3px] border-l-primary border-t border-r border-b border-t-primary/20 border-r-primary/20 border-b-primary/20'
              : 'border-slate-200 dark:border-slate-800',
          )}
        >
          <div className="p-5">
            {/* Дээд мөр: pin indicator + post type + answered badge */}
            <div className="flex items-center gap-2 mb-2.5">
              {post.isPinned && (
                <div className="flex items-center gap-1 text-primary">
                  <Pin className="size-3 rotate-45" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {t('pinned')}
                  </span>
                </div>
              )}

              {post.postType === 'question' ? (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-wider border-primary/30 text-primary bg-primary/5 gap-1"
                >
                  <HelpCircle className="size-3" />
                  {t('typeQuestion')}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-wider border-slate-300 dark:border-slate-600 text-slate-500 gap-1"
                >
                  <MessageSquare className="size-3" />
                  {t('typeDiscussion')}
                </Badge>
              )}

              {post.isAnswered && (
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 text-[10px] font-bold uppercase tracking-wider gap-1">
                  <span>✓</span>
                  {t('answered')}
                </Badge>
              )}
            </div>

            {/* Гарчиг */}
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 mb-3">
              {post.title || t('untitledPost')}
            </h3>

            {/* Зохиогч + tags */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <PostAuthorInfo
                authorName={post.authorName}
                authorAvatar={post.authorAvatar}
                createdAt={post.createdAt}
              />
              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-primary/80 font-medium bg-primary/5 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Статистик */}
            <div className="flex items-center gap-5 text-slate-400">
              <div className="flex items-center gap-1.5 text-xs">
                <ThumbsUp className="size-3.5" />
                <span>{post.upvotes}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <MessageCircle className="size-3.5" />
                <span>{post.replyCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Eye className="size-3.5" />
                <span>{post.viewsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
