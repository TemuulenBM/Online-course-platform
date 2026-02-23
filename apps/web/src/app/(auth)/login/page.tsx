'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { loginSchema, type LoginInput } from '@ocp/validation';
import { useLogin } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
  const t = useTranslations('auth');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full animation-fade-in flex flex-col pt-10 lg:pt-0">
      <div className="text-center lg:text-left mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          {t('loginTitle')}
        </h2>
        <p className="text-gray-500 font-medium text-sm">{t('loginSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {loginMutation.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
            <span className="shrink-0 bg-red-100 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">
              !
            </span>
            {t('invalidCredentials')}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-800 tracking-wide">
            {t('email')} <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <input
              {...register('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              className={`w-full px-4 py-3.5 rounded-xl bg-white border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400
                ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 hover:border-gray-300 focus:border-[#8A93E5] focus:ring-4 focus:ring-[#8A93E5]/10'}
              `}
              disabled={loginMutation.isPending}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-[13px] font-medium mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-800 tracking-wide">
            {t('password')} <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('passwordPlaceholder')}
              className={`w-full pl-4 pr-12 py-3.5 rounded-xl bg-white border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400
                ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 hover:border-gray-300 focus:border-[#8A93E5] focus:ring-4 focus:ring-[#8A93E5]/10'}
              `}
              disabled={loginMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
              disabled={loginMutation.isPending}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-[13px] font-medium mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between mt-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input type="checkbox" className="peer sr-only" disabled={loginMutation.isPending} />
              <div className="w-full h-full border-2 border-gray-300 rounded-[5px] peer-checked:bg-[#8A93E5] peer-checked:border-[#8A93E5] transition-colors"></div>
              <svg
                className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors select-none">
              {t('rememberMe')}
            </span>
          </label>

          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-sm font-semibold text-[#8A93E5] hover:text-[#6c77d4] transition-colors"
          >
            {t('forgotPasswordQuestion')}
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-[#8A93E5] hover:bg-[#7C80EF] text-white py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] mt-6"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('signingIn')}
            </>
          ) : (
            t('signIn')
          )}
        </button>
      </form>

      <div className="text-center mt-8">
        <p className="text-sm font-medium text-gray-600">
          {t('noAccount')}{' '}
          <Link
            href={ROUTES.REGISTER}
            className="text-[#8A93E5] font-bold hover:text-[#6c77d4] transition-colors"
          >
            {t('signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}
