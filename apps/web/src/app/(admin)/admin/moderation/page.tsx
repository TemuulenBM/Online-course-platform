'use client';

import { useState } from 'react';
import { ShieldAlert, Flag, Lock, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import {
  useModerationStats,
  useFlaggedContent,
  useApproveFlaggedContent,
  useRejectFlaggedContent,
} from '@/hooks/api';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { FlaggedContent } from '@/lib/api-services/admin.service';

/** Post type label mapping */
const postTypeLabels: Record<string, string> = {
  general: 'Ерөнхий',
  question: 'Асуулт',
  announcement: 'Зарлал',
};

/** Модерац хуудас — stats + flagged content cards */
export default function AdminModerationPage() {
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<FlaggedContent | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const { data: moderationStats, isLoading: statsLoading } = useModerationStats();
  const { data: flaggedData, isLoading: flaggedLoading } = useFlaggedContent({ page, limit: 12 });
  const approveMutation = useApproveFlaggedContent();
  const rejectMutation = useRejectFlaggedContent();

  const totalPages = flaggedData ? Math.ceil(flaggedData.total / 12) : 1;

  const handleApprove = (item: FlaggedContent) => {
    setRemovingIds((prev) => new Set(prev).add(item.id));
    approveMutation.mutate(item.id, {
      onSuccess: () => {
        toast.success('Нийтлэл амжилттай approve хийгдлээ');
        setTimeout(() => {
          setRemovingIds((prev) => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
          });
        }, 400);
      },
      onError: () => {
        toast.error('Approve хийхэд алдаа гарлаа');
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      },
    });
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    rejectMutation.mutate(
      { id: rejectTarget.id, reason: rejectReason || undefined },
      {
        onSuccess: () => {
          toast.success('Нийтлэл reject хийгдлээ');
          setRejectTarget(null);
          setRejectReason('');
        },
        onError: () => toast.error('Reject хийхэд алдаа гарлаа'),
      },
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
        <SidebarTrigger className="lg:hidden mr-4" />
        <ShieldAlert className="size-5 text-[#9c7aff] mr-2" />
        <h2 className="text-xl font-bold">Модерац</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-[#f6f5f8]">
        <div className="max-w-[1400px] mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Контент модерац</h1>
            <p className="text-sm text-slate-500 mt-1">
              Тэмдэглэгдсэн нийтлэлүүдийг хянах, approve/reject хийх
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {statsLoading ? (
              <>
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </>
            ) : (
              <>
                <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Flag className="size-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Тэмдэглэгдсэн</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {moderationStats?.flaggedCount ?? 0}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Lock className="size-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Түгжигдсэн</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {moderationStats?.lockedCount ?? 0}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Flagged content cards */}
          {flaggedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : flaggedData && flaggedData.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {flaggedData.data
                    .filter((item) => !removingIds.has(item.id))
                    .map((item) => (
                      <FlaggedContentCard
                        key={item.id}
                        item={item}
                        onApprove={() => handleApprove(item)}
                        onReject={() => {
                          setRejectTarget(item);
                          setRejectReason('');
                        }}
                        isApproving={approveMutation.isPending}
                      />
                    ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => page > 1 && setPage(page - 1)}
                          className={
                            page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            isActive={i + 1 === page}
                            onClick={() => setPage(i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => page < totalPages && setPage(page + 1)}
                          className={
                            page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="bg-white rounded-2xl border border-[#9c7aff]/5 shadow-sm py-20 text-center">
              <div className="size-20 rounded-full bg-emerald-50 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="size-10 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Бүх зүйл хэвийн!</h3>
              <p className="text-slate-500">Тэмдэглэгдсэн контент байхгүй байна</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-rose-500" />
              Нийтлэл reject хийх
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 mb-3">
              {rejectTarget?.title && (
                <span className="font-semibold">&quot;{rejectTarget.title}&quot;</span>
              )}{' '}
              нийтлэлийг reject хийх шалтгаанаа бичнэ үү:
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Шалтгаан (заавал биш)..."
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Болих
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejectMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {rejectMutation.isPending ? 'Reject хийж байна...' : 'Reject хийх'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Тэмдэглэгдсэн контент карт — inline approve/reject, fade-out анимац */
function FlaggedContentCard({
  item,
  onApprove,
  onReject,
  isApproving,
}: {
  item: FlaggedContent;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
      className="bg-white rounded-2xl border border-[#9c7aff]/5 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-[10px]">
            {postTypeLabels[item.postType] || item.postType}
          </Badge>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Eye className="size-3" />
            <span className="text-[10px]">{item.viewsCount}</span>
          </div>
        </div>
        {item.title && (
          <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">{item.title}</h4>
        )}
      </div>

      {/* Content preview */}
      <div className="p-4">
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {item.contentPreview}
          {item.contentPreview.length >= 200 && '...'}
        </p>
      </div>

      {/* Flag reason */}
      {item.flagReason && (
        <div className="px-4 pb-3">
          <div className="flex items-start gap-2 p-2 bg-rose-50 rounded-lg">
            <Flag className="size-3.5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-700 line-clamp-2">{item.flagReason}</p>
          </div>
        </div>
      )}

      {/* Footer + Actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-slate-400">
            {new Date(item.createdAt).toLocaleDateString('mn-MN')}
          </span>
          {item.isLocked && (
            <Badge className="bg-amber-100 text-amber-700 text-[10px]">
              <Lock className="size-3 mr-1" />
              Түгжигдсэн
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isApproving}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs h-9"
          >
            <CheckCircle className="size-3.5 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs h-9"
          >
            <XCircle className="size-3.5 mr-1" />
            Reject
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
