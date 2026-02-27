'use client';

import { cn } from '@/lib/utils';

type Period = 'day' | 'month' | 'year';

interface DateRangeFilterProps {
  period: Period;
  dateFrom: string;
  dateTo: string;
  onPeriodChange: (period: Period) => void;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onFilter: () => void;
  onReset?: () => void;
  showReset?: boolean;
}

const periodLabels: Record<Period, string> = {
  day: 'Өдөр',
  month: 'Сар',
  year: 'Жил',
};

/** Огнооны хүрээний шүүлтүүр — period toggle + date inputs + filter button */
export function DateRangeFilter({
  period,
  dateFrom,
  dateTo,
  onPeriodChange,
  onDateFromChange,
  onDateToChange,
  onFilter,
  onReset,
  showReset,
}: DateRangeFilterProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-primary/5 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Period toggle */}
        <div className="flex bg-primary/5 p-1 rounded-xl">
          {(['day', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={cn(
                'px-6 py-2 rounded-lg text-sm font-bold transition-colors',
                period === p
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-primary',
              )}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>

        {/* Date range + filter */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Эхлэх огноо
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="rounded-xl border border-primary/10 bg-primary/5 text-sm focus:ring-primary focus:border-primary py-2 px-4"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Дуусах огноо
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="rounded-xl border border-primary/10 bg-primary/5 text-sm focus:ring-primary focus:border-primary py-2 px-4"
            />
          </div>
          <div className="pt-5 flex gap-2">
            <button
              onClick={onFilter}
              className="bg-slate-900 dark:bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Шүүх
            </button>
            {showReset && onReset && (
              <button
                onClick={onReset}
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Тэглэх
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
