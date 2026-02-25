'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthButton } from '@/components/auth/auth-button';
import { AuthNavbar } from '@/components/auth/auth-navbar';
import { AuthFooter } from '@/components/auth/auth-footer';
import { useResetPassword } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE7F9] via-[#E0D6F5] to-[#D5CCF0] flex flex-col">
      <AuthNavbar variant="links" />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Токен байхгүй бол алдааны мэдээлэл */}
        {!token ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-[440px]">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-9 h-9 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('invalidResetToken')}</h2>
              <p className="text-gray-500 text-sm max-w-[300px] mb-8 leading-relaxed">
                {t('resetPasswordError')}
              </p>
              <Link href={ROUTES.FORGOT_PASSWORD} className="w-full">
                <AuthButton icon={<ArrowLeft className="w-5 h-5" />} iconPosition="left">
                  {t('forgotPasswordQuestion')}
                </AuthButton>
              </Link>
            </div>
          </div>
        ) : isSuccess ? (
          /* Амжилттай шинэчлэгдсэн төлөв */
          <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-[440px]">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-9 h-9 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('resetPasswordSuccess')}</h2>
              <p className="text-gray-500 text-sm max-w-[300px] mb-8 leading-relaxed">
                {t('resetPasswordSuccessSubtitle')}
              </p>
              <Link href={ROUTES.LOGIN} className="w-full">
                <AuthButton>{t('signIn')}</AuthButton>
              </Link>
            </div>
          </div>
        ) : (
          /* Формын төлөв */
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('resetPasswordHeading')}</h1>
            <p className="text-gray-500 text-sm mb-8">{t('resetPasswordHintNew')}</p>

            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-[440px]">
              {/* Алдааны мэдээлэл */}
              {resetPasswordMutation.error && (
                <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100 mb-5">
                  <span className="shrink-0 bg-red-100 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold">
                    !
                  </span>
                  {t('resetPasswordError')}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Шинэ нууц үг */}
                <AuthInput
                  id="password"
                  label={t('newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('newPasswordPlaceholderShort')}
                  rightIcon={
                    showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )
                  }
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  error={errors.password?.message}
                  disabled={resetPasswordMutation.isPending}
                  {...register('password')}
                />

                {/* Нууц үг баталгаажуулах */}
                <AuthInput
                  id="confirmPassword"
                  label={t('confirmPasswordLabel')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('confirmPasswordPlaceholderNew')}
                  rightIcon={
                    showConfirmPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )
                  }
                  onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  error={errors.confirmPassword ? t('passwordMismatch') : undefined}
                  disabled={resetPasswordMutation.isPending}
                  {...register('confirmPassword')}
                />

                <AuthButton
                  type="submit"
                  isLoading={resetPasswordMutation.isPending}
                  loadingText={t('resettingPassword')}
                >
                  {t('resetPasswordHeading')}
                </AuthButton>
              </form>
            </div>

            {/* Буцах холбоос */}
            <div className="mt-6">
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-[#6c77d4] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('goBackToLogin')}
              </Link>
            </div>
          </>
        )}
      </main>

      <AuthFooter />
    </div>
  );
}
