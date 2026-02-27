'use client';

import { ShieldCheck, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VerifySearchFormProps {
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

/** Баталгаажуулах код оруулах form */
export function VerifySearchForm({
  code,
  onCodeChange,
  onSubmit,
  isLoading,
}: VerifySearchFormProps) {
  const t = useTranslations('certificates');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-primary/10 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
        <label className="flex flex-col flex-1 w-full">
          <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2 ml-1">
            {t('verificationCode')}
          </span>
          <div className="relative group">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary size-5" />
            <Input
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder={t('verificationPlaceholder')}
              className="pl-12 h-14 rounded-xl"
            />
          </div>
        </label>
        <Button
          type="submit"
          disabled={!code.trim() || isLoading}
          className="w-full md:w-auto min-w-[160px] h-14 px-8 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all gap-2"
        >
          <Search className="size-4" />
          {isLoading ? t('verifying') : t('verify')}
        </Button>
      </form>
    </div>
  );
}
