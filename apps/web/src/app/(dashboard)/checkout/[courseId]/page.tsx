'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Landmark,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCourseById } from '@/hooks/api';
import { useCreateOrder } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

export default function CheckoutPage() {
  const t = useTranslations('payments');
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params.courseId;

  const { data: course, isLoading } = useCourseById(courseId);
  const createOrder = useCreateOrder();

  /** Захиалга үүсгэх */
  const handleCreateOrder = () => {
    createOrder.mutate(
      { courseId, paymentMethod: 'bank_transfer' },
      {
        onSuccess: (order) => {
          toast.success(t('orderCreated'));
          router.push(ROUTES.ORDER_DETAIL(order.id));
        },
        onError: () => {
          toast.error(t('orderCreateError'));
        },
      },
    );
  };

  /** Үнийн тооцоолол */
  const originalPrice = course?.price ?? 0;
  const finalPrice = course?.discountPrice ?? originalPrice;
  const discount = originalPrice - finalPrice;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href={ROUTES.COURSES} className="hover:text-primary transition-colors">
            {t('courses')}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">{t('checkout')}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            {t('confirmOrder')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{t('confirmOrderSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Зүүн багана — Сургалтын мэдээлэл + Банкны мэдээлэл */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Сургалтын карт */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {isLoading ? (
                  <>
                    <Skeleton className="w-full md:w-48 aspect-video md:aspect-square rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-6 w-64" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-8 w-40 mt-4" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full md:w-48 aspect-video md:aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                      {course?.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-4xl text-primary font-bold">
                            {course?.title?.[0] || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                          {t('premiumCourse')}
                        </span>
                        <h3 className="text-xl font-bold mt-2">{course?.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-2">
                          {course?.description}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          {discount > 0 && (
                            <span className="text-xs text-slate-400 line-through font-medium">
                              ₮{originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-lg font-bold text-primary">
                            ₮{finalPrice.toLocaleString()}
                          </span>
                        </div>
                        <Link
                          href={course?.slug ? ROUTES.COURSE_DETAIL(course.slug) : ROUTES.COURSES}
                          className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          {t('changeCourse')}
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Банк шилжүүлгийн мэдээлэл */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Landmark className="size-5 text-primary" />
                {t('paymentMethodBankTransfer')}
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm font-medium mb-4 text-slate-600 dark:text-slate-400">
                  {t('bankTransferInfo')}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">{t('bankName')}</span>
                    <span className="font-semibold">{t('bankNameValue')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">{t('accountNumber')}</span>
                    <span className="font-semibold font-mono tracking-wider">
                      {t('accountNumberValue')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">{t('accountHolder')}</span>
                    <span className="font-semibold">{t('accountHolderValue')}</span>
                  </div>
                </div>
                <p className="mt-4 text-[11px] text-slate-400 leading-relaxed italic">
                  {t('bankTransferNote')}
                </p>
              </div>
            </div>
          </div>

          {/* Баруун багана — Order Summary + Action */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold mb-6">{t('orderSummary')}</h3>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full mt-4" />
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('coursePrice')}</span>
                      {discount > 0 ? (
                        <span className="text-slate-400 line-through">
                          ₮{originalPrice.toLocaleString()}
                        </span>
                      ) : (
                        <span className="font-medium">₮{originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('discount')}</span>
                        <span className="text-green-500 font-medium">
                          -₮{discount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('platformFee')}</span>
                      <span className="font-medium">₮0</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                      <span className="font-bold">{t('totalAmount')}</span>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        ₮{finalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateOrder}
                    disabled={createOrder.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{t('createOrderBtn')}</span>
                    <ArrowRight className="size-5" />
                  </button>
                </>
              )}
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-start gap-3 text-xs text-slate-500">
                  <ShieldCheck className="size-4 shrink-0 mt-0.5" />
                  <p>{t('securePayment')}</p>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-500">
                  <RefreshCw className="size-4 shrink-0 mt-0.5" />
                  <p>{t('instantAccess')}</p>
                </div>
              </div>
            </div>

            {/* Тусламж карт */}
            <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 flex items-center gap-4">
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase">{t('needHelp')}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {t('needHelpDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
