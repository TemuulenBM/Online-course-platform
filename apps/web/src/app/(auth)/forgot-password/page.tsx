'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@ocp/validation';
import { useForgotPassword } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => setIsSubmitted(true),
    });
  };

  if (isSubmitted) {
    return (
      <div className="w-full animation-fade-in flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-2 border-green-200">
          <MailCheck className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          {t('checkEmail')}
        </h2>
        <p className="text-gray-500 font-medium text-sm max-w-[300px] mb-8">
          {t('checkEmailSubtitle')}
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="w-full bg-[#8A93E5] hover:bg-[#7C80EF] text-white py-4 rounded-2xl font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animation-fade-in flex flex-col">
      <Link
        href={ROUTES.LOGIN}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6 self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToLogin')}
      </Link>

      <div className="text-center lg:text-left mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          {t('forgotPasswordQuestion')}
        </h2>
        <p className="text-gray-500 font-medium text-sm">{t('forgotPasswordHint')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {forgotPasswordMutation.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
            <span className="shrink-0 bg-red-100 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">
              !
            </span>
            {t('serverError')}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-800 tracking-wide">
            {t('email')} <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder={t('emailPlaceholder')}
            className={`w-full px-4 py-3.5 rounded-xl bg-white border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400
              ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 hover:border-gray-300 focus:border-[#8A93E5] focus:ring-4 focus:ring-[#8A93E5]/10'}
            `}
            disabled={forgotPasswordMutation.isPending}
          />
          {errors.email && (
            <p className="text-red-500 text-[13px] font-medium mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="w-full bg-[#8A93E5] hover:bg-[#7C80EF] text-white py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
        >
          {forgotPasswordMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('sending')}
            </>
          ) : (
            t('resetPassword')
          )}
        </button>
      </form>
    </div>
  );
}
