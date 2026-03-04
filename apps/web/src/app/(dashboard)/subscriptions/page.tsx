'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, CheckCircle, Calendar, AlertTriangle, CalendarClock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useMySubscription, useCancelSubscription, useCreateSubscription } from '@/hooks/api';
import type { SubscriptionStatus } from '@ocp/shared-types';
import { cn } from '@/lib/utils';

/** Subscription статусын өнгө */
function getStatusStyle(status: SubscriptionStatus) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'cancelled':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    case 'expired':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

/** Төлөвлөгөөний сонголт */
const PLAN_OPTIONS = [
  {
    planType: 'monthly',
    labelKey: 'planMonthly' as const,
    price: '₮29,900',
    period: '/сар',
    features: ['Бүх сургалтад хандах', 'Тасралтгүй хандалт', 'Сертификат авах'],
    icon: Zap,
    highlight: false,
  },
  {
    planType: 'yearly',
    labelKey: 'planYearly' as const,
    price: '₮299,000',
    period: '/жил',
    features: ['Бүх сургалтад хандах', 'Тасралтгүй хандалт', 'Сертификат авах', '2 сар үнэгүй'],
    icon: Sparkles,
    highlight: true,
  },
];

export default function SubscriptionsPage() {
  const t = useTranslations('payments');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: subscription, isLoading, isError } = useMySubscription();
  const cancelSubscription = useCancelSubscription();
  const createSubscription = useCreateSubscription();

  /** Бүртгэл цуцлах */
  const handleCancel = () => {
    if (!subscription) return;
    cancelSubscription.mutate(subscription.id, {
      onSuccess: () => {
        toast.success(t('subscriptionCancelSuccess'));
        setCancelDialogOpen(false);
      },
      onError: () => {
        toast.error(t('subscriptionCancelError'));
      },
    });
  };

  /** Бүртгэл үүсгэх */
  const handleSubscribe = (planType: string) => {
    setSelectedPlan(planType);
    createSubscription.mutate(
      { planType },
      {
        onSuccess: () => {
          toast.success(t('subscriptionCreated'));
          setSelectedPlan(null);
        },
        onError: () => {
          toast.error(t('subscriptionCreateError'));
          setSelectedPlan(null);
        },
      },
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Sparkles className="size-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t('mySubscription')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{t('mySubscriptionSubtitle')}</p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        )}

        {/* Идэвхтэй subscription байгаа үед */}
        {!isLoading && subscription && (
          <>
            {/* cancelAtPeriodEnd warning */}
            {subscription.cancelAtPeriodEnd && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t('subscriptionCancelAtPeriodEnd')}
                </p>
              </div>
            )}

            {/* Subscription card */}
            <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-8 text-white shadow-xl shadow-primary/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-5" />
                    <span className="text-white/80 text-sm font-medium uppercase tracking-widest">
                      {t('subscriptionPlan')}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold capitalize">{subscription.planType}</h2>
                </div>
                <span
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider',
                    subscription.status === 'active'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/70',
                  )}
                >
                  {subscription.status === 'active'
                    ? t('subscriptionActive')
                    : subscription.status === 'cancelled'
                      ? t('subscriptionCancelledStatus')
                      : t('subscriptionExpired')}
                </span>
              </div>

              {/* Хугацаа */}
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                    <Calendar className="size-3.5" />
                    <span>{t('subscriptionPeriod')}</span>
                  </div>
                  <p className="font-semibold text-sm">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString('sv-SE')}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                    <CalendarClock className="size-3.5" />
                    <span>Дуусах огноо</span>
                  </div>
                  <p className="font-semibold text-sm">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('sv-SE')}
                  </p>
                </div>
              </div>
            </div>

            {/* Цуцлах товч — зөвхөн active subscription-д */}
            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCancelDialogOpen(true)}
                  className="px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('cancelSubscription')}
                </button>
              </div>
            )}
          </>
        )}

        {/* Subscription байхгүй эсвэл error бол төлөвлөгөө сонгох */}
        {!isLoading && (isError || !subscription) && (
          <>
            <EmptyState
              icon={Sparkles}
              title={t('noSubscription')}
              description={t('noSubscriptionDesc')}
            />

            {/* Төлөвлөгөөний карт */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PLAN_OPTIONS.map((plan) => {
                const Icon = plan.icon;
                const isPending = createSubscription.isPending && selectedPlan === plan.planType;

                return (
                  <div
                    key={plan.planType}
                    className={cn(
                      'relative rounded-2xl border p-8 flex flex-col',
                      plan.highlight
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-border bg-card',
                    )}
                  >
                    {plan.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full">
                        Хамгийн алдартай
                      </span>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={cn(
                          'size-10 rounded-xl flex items-center justify-center',
                          plan.highlight
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-primary',
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-bold text-lg">{t(plan.labelKey)}</h3>
                    </div>

                    <div className="mb-6">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>

                    <ul className="space-y-2 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="size-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => handleSubscribe(plan.planType)}
                      disabled={createSubscription.isPending}
                      className={cn(
                        'w-full py-3 rounded-xl font-bold text-sm transition-all',
                        plan.highlight
                          ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25'
                          : 'border border-primary text-primary hover:bg-primary/5',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                    >
                      {isPending ? '...' : t('subscribePlan')}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Цуцлах confirmation dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancelSubscriptionConfirm')}</DialogTitle>
            <DialogDescription>{t('cancelSubscriptionDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setCancelDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Буцах
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelSubscription.isPending}
              className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {cancelSubscription.isPending ? '...' : t('cancelSubscription')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
