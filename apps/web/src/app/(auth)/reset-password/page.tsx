'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { useResetPassword } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';

/** Input талбарын стиль */
const inputBase =
  'w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 font-medium text-sm';
const inputFocus = 'focus:border-[#8A93E5] focus:ring-2 focus:ring-[#8A93E5]/20 focus:bg-white';
const inputError = 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200/50';

/** Нууц үг шинэчлэх формын schema — confirmPassword баталгаажуулалттай */
const resetFormSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
  });

type ResetFormInput = z.infer<typeof resetFormSchema>;

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormInput>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ResetFormInput) => {
    if (!token) return;
    resetPasswordMutation.mutate(
      { token, password: data.password },
      {
        onSuccess: () => setIsSuccess(true),
      },
    );
  };

  /* Токен байхгүй бол алдааны мэдээлэл */
  if (!token) {
    return (
      <div className="w-full flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-9 h-9 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('invalidResetToken')}</h2>
        <p className="text-gray-500 text-sm font-medium max-w-[300px] mb-8 leading-relaxed">
          {t('resetPasswordError')}
        </p>
        <Link
          href={ROUTES.FORGOT_PASSWORD}
          className="w-full bg-[#8A93E5] hover:bg-[#7B8AD4] text-white py-3.5 rounded-2xl font-bold text-base transition-all duration-200 shadow-lg shadow-[#8A93E5]/25 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('forgotPasswordQuestion')}
        </Link>
      </div>
    );
  }

  /* Амжилттай шинэчлэгдсэн төлөв */
  if (isSuccess) {
    return (
      <div className="w-full flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-9 h-9 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('resetPasswordSuccess')}</h2>
        <p className="text-gray-500 text-sm font-medium max-w-[300px] mb-8 leading-relaxed">
          {t('resetPasswordSuccessSubtitle')}
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="w-full bg-[#8A93E5] hover:bg-[#7B8AD4] text-white py-3.5 rounded-2xl font-bold text-base transition-all duration-200 shadow-lg shadow-[#8A93E5]/25 flex items-center justify-center gap-2"
        >
          {t('signIn')}
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('resetPasswordTitle')}</h2>
        <p className="text-gray-500 text-sm font-medium">{t('resetPasswordSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {resetPasswordMutation.error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100">
            <span className="shrink-0 bg-red-100 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold">
              !
            </span>
            {t('resetPasswordError')}
          </div>
        )}

        {/* Шинэ нууц үг */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-gray-700 ml-0.5">
            {t('newPassword')}
          </label>
          <div className="relative">
            <input
              id="password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('newPasswordPlaceholder')}
              className={`${inputBase} pr-12 ${errors.password ? inputError : inputFocus}`}
              disabled={resetPasswordMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              disabled={resetPasswordMutation.isPending}
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.password.message}</p>
          )}
        </div>

        {/* Нууц үг давтах */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 ml-0.5">
            {t('confirmPassword')}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('confirmPasswordPlaceholder')}
              className={`${inputBase} pr-12 ${errors.confirmPassword ? inputError : inputFocus}`}
              disabled={resetPasswordMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              disabled={resetPasswordMutation.isPending}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs font-medium mt-1 ml-1">{t('passwordMismatch')}</p>
          )}
        </div>

        {/* Шинэчлэх товч */}
        <button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className="w-full bg-[#8A93E5] hover:bg-[#7B8AD4] text-white py-3.5 rounded-2xl font-bold text-base transition-all duration-200 shadow-lg shadow-[#8A93E5]/25 hover:shadow-[#8A93E5]/40 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 mt-2"
        >
          {resetPasswordMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('resettingPassword')}
            </>
          ) : (
            t('resetPassword')
          )}
        </button>
      </form>
    </div>
  );
}
