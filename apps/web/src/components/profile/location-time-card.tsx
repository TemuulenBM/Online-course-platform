'use client';

import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { UpdateProfileInput } from '@ocp/validation';
import { Skeleton } from '@/components/ui/skeleton';

/** Улсын жагсаалт */
const COUNTRIES = [
  { value: 'Монгол', label: 'Монгол' },
  { value: 'АНУ', label: 'АНУ' },
  { value: 'Герман', label: 'Герман' },
  { value: 'Япон', label: 'Япон' },
  { value: 'Солонгос', label: 'Солонгос' },
  { value: 'Хятад', label: 'Хятад' },
  { value: 'Англи', label: 'Англи' },
  { value: 'Австрали', label: 'Австрали' },
];

/** Цагийн бүс жагсаалт */
const TIMEZONES = [
  { value: '(GMT+08:00) Ulaanbaatar', label: '(GMT+08:00) Ulaanbaatar' },
  { value: '(GMT+09:00) Tokyo', label: '(GMT+09:00) Tokyo' },
  { value: '(GMT+09:00) Seoul', label: '(GMT+09:00) Seoul' },
  { value: '(GMT+08:00) Beijing', label: '(GMT+08:00) Beijing' },
  { value: '(GMT+01:00) Berlin', label: '(GMT+01:00) Berlin' },
  { value: '(GMT+00:00) London', label: '(GMT+00:00) London' },
  { value: '(GMT-05:00) New York', label: '(GMT-05:00) New York' },
  { value: '(GMT-08:00) Los Angeles', label: '(GMT-08:00) Los Angeles' },
  { value: '(GMT+10:00) Sydney', label: '(GMT+10:00) Sydney' },
];

const selectStyle =
  'w-full px-4 py-3 bg-[#f6f5f8] border-none rounded-xl focus:ring-2 focus:ring-[#9c7aff] text-slate-900 font-medium outline-none transition-all appearance-none cursor-pointer';

interface LocationTimeCardProps {
  register: UseFormRegister<UpdateProfileInput>;
  setValue: UseFormSetValue<UpdateProfileInput>;
  watch: UseFormWatch<UpdateProfileInput>;
  isPending: boolean;
  isLoading: boolean;
}

export function LocationTimeCard({ register, isPending, isLoading }: LocationTimeCardProps) {
  if (isLoading) {
    return <LocationTimeSkeleton />;
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#9c7aff]/5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Байршил ба Хугацаа</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Улс */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Улс</label>
          <select {...register('country')} className={selectStyle} disabled={isPending}>
            <option value="">Сонгох...</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Цагийн бүс */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Цагийн бүс</label>
          <select {...register('timezone')} className={selectStyle} disabled={isPending}>
            <option value="">Сонгох...</option>
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/** Loading skeleton */
function LocationTimeSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-[#9c7aff]/5 shadow-sm">
      <Skeleton className="h-6 w-44 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
