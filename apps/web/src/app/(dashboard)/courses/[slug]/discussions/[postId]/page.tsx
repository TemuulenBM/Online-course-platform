'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  useCourseBySlug,
  useDiscussionPost,
  useAddReply,
  useVoteDiscussionPost,
  usePinPost,
  useLockPost,
  useFlagPost,
  useAcceptAnswer,
  useDeleteReply,
} from '@/hooks/api';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';
import { VoteButtons } from '@/components/discussions/vote-buttons';
import { DiscussionBreadcrumbs } from '@/components/discussions/discussion-breadcrumbs';
import { ConfirmDeleteDialog } from '@/components/discussions/confirm-delete-dialog';
import { PostDetailCard } from '@/components/discussions/detail/post-detail-card';
import { PostDetailSkeleton } from '@/components/discussions/detail/post-detail-skeleton';
import { VoteSidebar } from '@/components/discussions/detail/vote-sidebar';
import { ReplyCard } from '@/components/discussions/detail/reply-card';
import { ReplyInput } from '@/components/discussions/detail/reply-input';

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = use(params);
  const t = useTranslations('discussions');
  const user = useAuthStore((s) => s.user);

  const { data: course } = useCourseBySlug(slug);
  const courseId = course?.id || '';

  const { data: post, isLoading } = useDiscussionPost(postId);

  const addReplyMutation = useAddReply(courseId, postId);
  const voteMutation = useVoteDiscussionPost(courseId, postId);
  const pinMutation = usePinPost(courseId, postId);
  const lockMutation = useLockPost(courseId, postId);
  const flagMutation = useFlagPost(courseId, postId);
  const acceptMutation = useAcceptAnswer(courseId, postId);
  const deleteReplyMutation = useDeleteReply(courseId, postId);

  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null);

  /** Эрхийн шалгалт */
  const userRole = user?.role;
  const isModOrAdmin = userRole === 'teacher' || userRole === 'admin';
  const isPostOwner = user?.id === post?.authorId;

  /** Vote */
  const handleVote = (voteType: 'up' | 'down') => {
    voteMutation.mutate({ postId, voteType });
  };

  /** Reply илгээх */
  const handleReply = (content: string, contentHtml: string) => {
    addReplyMutation.mutate(
      { content, contentHtml },
      {
        onSuccess: () => {
          toast.success(t('replySuccess'));
        },
      },
    );
  };

  /** Accept answer */
  const handleAccept = (replyId: string) => {
    acceptMutation.mutate(replyId);
  };

  /** Delete reply */
  const handleDeleteReply = () => {
    if (!deleteReplyId) return;
    deleteReplyMutation.mutate(deleteReplyId, {
      onSuccess: () => {
        toast.success(t('replyDeleted'));
        setDeleteReplyId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <PostDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500">
        {t('postNotFound')}
      </div>
    );
  }

  /** Accepted reply эхэндээ, бусдыг дараа нь */
  const acceptedReply = post.replies?.find((r) => r.replyId === post.acceptedAnswerId);
  const otherReplies = post.replies?.filter((r) => r.replyId !== post.acceptedAnswerId);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <DiscussionBreadcrumbs
          items={[
            { label: t('breadcrumbForum'), href: ROUTES.COURSE_DISCUSSIONS(slug) },
            { label: post.title || t('untitledPost') },
          ]}
        />

        {/* Post detail + vote sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex gap-6 mb-8"
        >
          {/* Desktop vote sidebar */}
          <VoteSidebar voteScore={post.voteScore} userVote={post.userVote} onVote={handleVote} />

          {/* Post card */}
          <div className="flex-1 min-w-0">
            {/* Mobile vote buttons */}
            <div className="flex md:hidden mb-4">
              <VoteButtons
                voteScore={post.voteScore}
                userVote={post.userVote}
                onVote={handleVote}
                variant="horizontal"
                size="sm"
              />
            </div>

            <PostDetailCard
              post={post}
              showModeration={isModOrAdmin}
              onPin={() => pinMutation.mutate()}
              onLock={() => lockMutation.mutate()}
              onFlag={() => flagMutation.mutate()}
            />
          </div>
        </motion.div>

        {/* Хариултууд */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('repliesTitle')}
            </h2>
          </div>

          {/* Accepted answer эхэлж харагдана */}
          {acceptedReply && (
            <ReplyCard
              reply={acceptedReply}
              isAccepted
              isOwner={user?.id === acceptedReply.authorId}
              canAccept={false}
              onAccept={() => {}}
              onEdit={() => {}}
              onDelete={() => setDeleteReplyId(acceptedReply.replyId)}
            />
          )}

          {/* Бусад хариултууд */}
          {otherReplies?.map((reply) => (
            <ReplyCard
              key={reply.replyId}
              reply={reply}
              isAccepted={false}
              isOwner={user?.id === reply.authorId || isModOrAdmin}
              canAccept={(isPostOwner || isModOrAdmin) && post.postType === 'question'}
              onAccept={() => handleAccept(reply.replyId)}
              onEdit={() => {}}
              onDelete={() => setDeleteReplyId(reply.replyId)}
            />
          ))}

          {!post.replies?.length && (
            <p className="text-sm text-slate-400 text-center py-8">{t('noReplies')}</p>
          )}
        </motion.div>

        {/* Хариулт бичих input */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-8"
        >
          <ReplyInput
            onSubmit={handleReply}
            isPending={addReplyMutation.isPending}
            isLocked={post.isLocked}
          />
        </motion.div>

        {/* Устгах dialog */}
        <ConfirmDeleteDialog
          open={!!deleteReplyId}
          onOpenChange={(open) => !open && setDeleteReplyId(null)}
          title={t('deleteReplyTitle')}
          description={t('deleteReplyDescription')}
          onConfirm={handleDeleteReply}
          isPending={deleteReplyMutation.isPending}
        />
      </div>
    </div>
  );
}
