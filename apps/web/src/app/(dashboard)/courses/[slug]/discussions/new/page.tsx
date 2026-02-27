'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, Loader2, Send, FileText, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { useCourseBySlug, useCreateDiscussionPost } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DiscussionBreadcrumbs } from '@/components/discussions/discussion-breadcrumbs';
import { DiscussionRichEditor } from '@/components/discussions/discussion-rich-editor';
import { TagInput } from '@/components/discussions/tag-input';
import { cn } from '@/lib/utils';

export default function CreateDiscussionPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations('discussions');
  const router = useRouter();

  const { data: course, isLoading: courseLoading } = useCourseBySlug(slug);
  const createMutation = useCreateDiscussionPost(course?.id || '');

  const [postType, setPostType] = useState<'question' | 'discussion'>('question');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [contentHtml, setContentHtml] = useState('');
  const [contentText, setContentText] = useState('');

  const canSubmit = title.trim() && contentText.trim() && course?.id;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createMutation.mutate(
      {
        courseId: course!.id,
        postType,
        title: title.trim(),
        content: contentText,
        contentHtml,
        tags: tags.length > 0 ? tags : undefined,
      },
      {
        onSuccess: (data) => {
          toast.success(t('postCreatedSuccess'));
          router.push(ROUTES.COURSE_DISCUSSION_POST(slug, data.id));
        },
        onError: () => {
          toast.error(t('postCreatedError'));
        },
      },
    );
  };

  if (courseLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500">
        {t('courseNotFound')}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumbs */}
        <DiscussionBreadcrumbs
          items={[
            { label: t('breadcrumbDiscussions'), href: ROUTES.COURSE_DISCUSSIONS(slug) },
            { label: t('breadcrumbNewPost') },
          ]}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('createPostTitle')}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">{t('createPostSubtitle')}</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="space-y-6"
        >
          {/* Төрөл сонгох */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('fieldPostType')}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPostType('question')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all',
                  postType === 'question'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300',
                )}
              >
                <HelpCircle className="size-4" />
                {t('typeQuestion')}
              </button>
              <button
                type="button"
                onClick={() => setPostType('discussion')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all',
                  postType === 'discussion'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300',
                )}
              >
                <MessageSquare className="size-4" />
                {t('typeDiscussion')}
              </button>
            </div>
          </div>

          {/* Гарчиг */}
          <div className="space-y-2">
            <label
              htmlFor="post-title"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              {t('fieldTitle')}
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Шошго */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('fieldTags')}
            </label>
            <TagInput tags={tags} onChange={setTags} placeholder={t('tagsPlaceholder')} />
          </div>

          {/* Агуулга — Rich Editor */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('fieldContent')}
            </label>
            <DiscussionRichEditor
              content={contentHtml}
              onChange={(html, text) => {
                setContentHtml(html);
                setContentText(text);
              }}
              placeholder={t('contentPlaceholder')}
              minHeight="250px"
            />
          </div>

          {/* Товчнууд */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => router.push(ROUTES.COURSE_DISCUSSIONS(slug))}
            >
              {t('draftButton')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || createMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 shadow-md shadow-primary/20"
            >
              {createMutation.isPending ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Send className="size-4 mr-2" />
              )}
              {t('publishButton')}
            </Button>
          </div>
        </motion.div>

        {/* Доод: Дүрэм + Зөвлөгөө grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10"
        >
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <FileText className="size-5 text-primary" />
              <h3>{t('guidelinesTitle')}</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {t('guideline1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {t('guideline2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {t('guideline3')}
              </li>
            </ul>
          </div>

          <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Lightbulb className="size-5" />
              <h3>{t('tipsTitle')}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('tipsContent')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
