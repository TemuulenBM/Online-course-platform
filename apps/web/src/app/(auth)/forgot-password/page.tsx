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

/** Input талбарын стиль */
const inputBase =
  'w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 font-medium text-sm';
const inputFocus = 'focus:border-[#8A93E5] focus:ring-2 focus:ring-[#8A93E5]/20 focus:bg-white';
const inputError = 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200/50';

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

  /* Амжилттай илгээгдсэн төлөв */
  if (isSubmitted) {
    return (
      <div className="w-full flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-[#8A93E5]/10 rounded-full flex items-center justify-center mb-6">
          <MailCheck className="w-9 h-9 text-[#8A93E5]" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('checkEmail')} 📬</h2>
        <p className="text-gray-500 text-sm font-medium max-w-[300px] mb-8 leading-relaxed">
          {t('checkEmailSubtitle')}
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="w-full bg-[#8A93E5] hover:bg-[#7B8AD4] text-white py-3.5 rounded-2xl font-bold text-base transition-all duration-200 shadow-lg shadow-[#8A93E5]/25 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <Link
        href={ROUTES.LOGIN}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors mb-8 self-start group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {t('backToLogin')}
      </Link>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('forgotPasswordQuestion')} 🔑</h2>
        <p className="text-gray-500 text-sm font-medium">{t('forgotPasswordHint')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {forgotPasswordMutation.error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100">
            <span className="shrink-0 bg-red-100 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold">
              !
            </span>
            {t('serverError')}
          </div>
        )}

        {/* Имэйл */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-gray-700 ml-0.5">
            {t('email')}
          </label>
          <input
            id="email"
            {...register('email')}
            type="email"
            placeholder={t('emailPlaceholder')}
            className={`${inputBase} ${errors.email ? inputError : inputFocus}`}
            disabled={forgotPasswordMutation.isPending}
          />
          {errors.email && (
            <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.email.message}</p>
          )}
        </div>

        {/* Илгээх товч */}
        <button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="w-full bg-[#8A93E5] hover:bg-[#7B8AD4] text-white py-3.5 rounded-2xl font-bold text-base transition-all duration-200 shadow-lg shadow-[#8A93E5]/25 hover:shadow-[#8A93E5]/40 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 mt-2"
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
