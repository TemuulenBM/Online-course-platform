'use client';

import { Lock } from 'lucide-react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { UpdateProfileInput } from '@ocp/validation';
import { Skeleton } from '@/components/ui/skeleton';

/** Input стиль */
const inputStyle =
  'w-full px-4 py-3 bg-[#f6f5f8] border-none rounded-xl focus:ring-2 focus:ring-[#9c7aff] text-slate-900 font-medium outline-none transition-all';
const inputError =
  'w-full px-4 py-3 bg-red-50 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-400 text-slate-900 font-medium outline-none transition-all';

interface BasicInfoCardProps {
  register: UseFormRegister<UpdateProfileInput>;
  errors: FieldErrors<UpdateProfileInput>;
  email: string;
  isPending: boolean;
  isLoading: boolean;
}

export function BasicInfoCard({
  register,
  errors,
  email,
  isPending,
  isLoading,
}: BasicInfoCardProps) {
  if (isLoading) {
    return <BasicInfoSkeleton />;
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#9c7aff]/5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Үндсэн мэдээлэл</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Нэр */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Нэр</label>
          <input
            {...register('firstName')}
            className={errors.firstName ? inputError : inputStyle}
            disabled={isPending}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs font-medium">{errors.firstName.message}</p>
          )}
        </div>

        {/* Овог */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Овог</label>
          <input
            {...register('lastName')}
            className={errors.lastName ? inputError : inputStyle}
            disabled={isPending}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs font-medium">{errors.lastName.message}</p>
          )}
        </div>

        {/* Имэйл — read-only */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-slate-600">
            Имэйл хаяг (Засах боломжгүй)
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              readOnly
              disabled
              className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-slate-400 font-medium cursor-not-allowed"
            />
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* Миний тухай */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-slate-600">Миний тухай</label>
          <textarea
            {...register('bio')}
            rows={4}
            className={`${errors.bio ? inputError : inputStyle} resize-none`}
            disabled={isPending}
          />
          {errors.bio && <p className="text-red-500 text-xs font-medium">{errors.bio.message}</p>}
        </div>
      </div>
    </div>
  );
}

/** Loading skeleton */
function BasicInfoSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-[#9c7aff]/5 shadow-sm">
      <Skeleton className="h-6 w-40 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
