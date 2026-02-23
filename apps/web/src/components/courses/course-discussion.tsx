'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronDown, ChevronUp, Lock, MessageCircle, Pin, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useAuthStore } from '@/stores/auth-store';
import {
  useDiscussionPosts,
  useCreateDiscussionPost,
  useVoteDiscussionPost,
  useCheckEnrollment,
} from '@/hooks/api';
import type { PostsListParams } from '@/lib/api-services/discussions.service';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

interface CourseDiscussionProps {
  courseId: string;
}

/** Хэлэлцүүлэг таб — бодит API холболттой */
export function CourseDiscussion({ courseId }: CourseDiscussionProps) {
  const t = useTranslations('courses');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [params, setParams] = useState<PostsListParams>({
    page: 1,
    limit: 10,
    sortBy: 'newest',
  });
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useDiscussionPosts(courseId, params);
  const { data: enrollment } = useCheckEnrollment(isAuthenticated ? courseId : '');
  const canPost = isAuthenticated && !!enrollment?.isEnrolled;

  /** Loading skeleton */
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const hasMore = posts.length < total;

  return (
    <div className="flex flex-col gap-5 py-6">
      {/* Шинэ нийтлэл бичих хэсэг */}
      <PostActionArea
        courseId={courseId}
        canPost={canPost}
        isAuthenticated={isAuthenticated}
        showForm={showForm}
        setShowForm={setShowForm}
        t={t}
      />

      {/* Нийтлэлүүдийн жагсаалт */}
      {posts.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} courseId={courseId} t={t} />
          ))}

          {/* Цааш үзэх */}
          {hasMore && (
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1, limit: total }))}
              className="self-center text-sm font-medium text-[#8A93E5] hover:text-[#7B84D8] transition-colors"
            >
              {t('loadMore')}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/** Хоосон state */
function EmptyState({ t }: { t: ReturnType<typeof useTranslations<'courses'>> }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-[#8A93E5]/10 flex items-center justify-center mb-4">
        <MessageCircle className="size-7 text-[#8A93E5]" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium">{t('noDiscussions')}</p>
    </div>
  );
}

/** Нийтлэл бичих хэсэг */
function PostActionArea({
  courseId,
  canPost,
  isAuthenticated,
  showForm,
  setShowForm,
  t,
}: {
  courseId: string;
  canPost: boolean;
  isAuthenticated: boolean;
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  t: ReturnType<typeof useTranslations<'courses'>>;
}) {
  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
        <p className="text-sm text-slate-500">{t('loginToDiscuss')}</p>
        <Link
          href={ROUTES.LOGIN}
          className="mt-2 inline-block text-sm font-medium text-[#8A93E5] hover:underline"
        >
          {t('loginToDiscuss')}
        </Link>
      </div>
    );
  }

  if (!canPost) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
        <p className="text-sm text-slate-500">{t('enrollToDiscuss')}</p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-4 text-sm font-medium text-slate-500 hover:border-[#8A93E5] hover:text-[#8A93E5] transition-colors"
      >
        + {t('writePost')}
      </button>
    );
  }

  return <CreatePostForm courseId={courseId} onClose={() => setShowForm(false)} t={t} />;
}

/** Шинэ нийтлэл form */
function CreatePostForm({
  courseId,
  onClose,
  t,
}: {
  courseId: string;
  onClose: () => void;
  t: ReturnType<typeof useTranslations<'courses'>>;
}) {
  const [postType, setPostType] = useState<'question' | 'discussion'>('discussion');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const createMutation = useCreateDiscussionPost(courseId);

  const handleSubmit = () => {
    if (!content.trim()) return;
    createMutation.mutate(
      {
        courseId,
        postType,
        title: title.trim() || undefined,
        content: content.trim(),
        contentHtml: `<p>${content.trim()}</p>`,
      },
      {
        onSuccess: () => {
          toast.success(t('submitPost'));
          setTitle('');
          setContent('');
          onClose();
        },
      },
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      {/* PostType сонголт */}
      <div className="flex gap-2">
        {(['discussion', 'question'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setPostType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              postType === type
                ? 'bg-[#8A93E5] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {type === 'question' ? t('question') : t('discussionType')}
          </button>
        ))}
      </div>

      {/* Гарчиг */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('postTitle')}
        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#8A93E5] focus:outline-none"
      />

      {/* Агуулга */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('postContent')}
        rows={3}
        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#8A93E5] focus:outline-none resize-none"
      />

      {/* Товчнууд */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending || !content.trim()}
          className="flex items-center gap-1.5 bg-[#8A93E5] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#7B84D8] disabled:opacity-50 transition-colors"
        >
          <Send className="size-3.5" />
          {t('submitPost')}
        </button>
      </div>
    </div>
  );
}

/** Нэг нийтлэлийн карт */
function PostCard({
  post,
  courseId,
  t,
}: {
  post: {
    id: string;
    postType: 'question' | 'discussion';
    title?: string;
    isAnswered: boolean;
    upvotes: number;
    downvotes: number;
    voteScore: number;
    replyCount: number;
    viewsCount: number;
    isPinned: boolean;
    isLocked: boolean;
    userVote: 'up' | 'down' | null;
    tags: string[];
    createdAt: string;
    authorId: string;
  };
  courseId: string;
  t: ReturnType<typeof useTranslations<'courses'>>;
}) {
  const voteMutation = useVoteDiscussionPost(courseId);

  const handleVote = (voteType: 'up' | 'down') => {
    voteMutation.mutate({ postId: post.id, voteType });
  };

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
      <div className="flex items-start gap-3">
        {/* Vote товчнууд */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => handleVote('up')}
            disabled={voteMutation.isPending}
            className={`p-1 rounded transition-colors ${
              post.userVote === 'up' ? 'text-[#8A93E5]' : 'text-slate-400 hover:text-[#8A93E5]'
            }`}
          >
            <ChevronUp className="size-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {post.voteScore}
          </span>
          <button
            type="button"
            onClick={() => handleVote('down')}
            disabled={voteMutation.isPending}
            className={`p-1 rounded transition-colors ${
              post.userVote === 'down' ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <ChevronDown className="size-4" />
          </button>
        </div>

        {/* Агуулга */}
        <div className="flex-1 min-w-0">
          {/* Badge + Title */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                post.postType === 'question'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}
            >
              {post.postType === 'question' ? t('question') : t('discussionType')}
            </span>

            {post.isPinned && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Pin className="size-3" />
                {t('pinned')}
              </span>
            )}

            {post.isAnswered && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">
                <CheckCircle2 className="size-3" />
                {t('answered')}
              </span>
            )}

            {post.isLocked && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
                <Lock className="size-3" />
                {t('locked')}
              </span>
            )}
          </div>

          {/* Title */}
          {post.title && (
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
              {post.title}
            </h4>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3" />
              {t('replies', { count: post.replyCount })}
            </span>
            <span>{t('views', { count: post.viewsCount })}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
