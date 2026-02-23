'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { registerSchema, type RegisterInput } from '@ocp/validation';
import { useRegister } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';

/** Input талбарын стиль */
const inputBase =
  'w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 font-medium text-sm';
const inputFocus = 'focus:border-[#8A93E5] focus:ring-2 focus:ring-[#8A93E5]/20 focus:bg-white';
const inputError = 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200/50';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('registerTitle')} 🎉</h2>
        <p className="text-gray-500 text-sm font-medium">{t('signUpSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {registerMutation.error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100">
            <span className="shrink-0 bg-red-100 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold">
              !
            </span>
            {t('registrationFailed')}
          </div>
        )}

        {/* Нэр, Овог */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-semibold text-gray-700 ml-0.5">
              {t('firstName')}
            </label>
            <input
              id="firstName"
              {...register('firstName')}
              type="text"
              placeholder={t('firstNamePlaceholder')}
              className={`${inputBase} ${errors.firstName ? inputError : inputFocus}`}
              disabled={registerMutation.isPending}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs font-medium mt-1 ml-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-semibold text-gray-700 ml-0.5">
              {t('lastName')}
            </label>
            <input
              id="lastName"
              {...register('lastName')}
              type="text"
              placeholder={t('lastNamePlaceholder')}
              className={`${inputBase} ${errors.lastName ? inputError : inputFocus}`}
              disabled={registerMutation.isPending}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs font-medium mt-1 ml-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

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
            disabled={registerMutation.isPending}
          />
          {errors.email && (
            <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.email.message}</p>
          )}
        </div>

        {/* Нууц үг */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-gray-700 ml-0.5">
            {t('password')}
          </label>
          <div className="relative">
            <input
              id="password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('passwordPlaceholder')}
              className={`${inputBase} pr-12 ${errors.password ? inputError : inputFocus}`}
              disabled={registerMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              disabled={registerMutation.isPending}
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

        {/* Бүртгүүлэх товч */}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full bg-[#8A93E5] hover:bg-[#7B8AD4] text-white py-3.5 rounded-2xl font-bold text-base transition-all duration-200 shadow-lg shadow-[#8A93E5]/25 hover:shadow-[#8A93E5]/40 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 mt-2"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('creatingAccount')}
            </>
          ) : (
            t('signUp')
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm font-medium text-gray-500">
          {t('hasAccount')}{' '}
          <Link
            href={ROUTES.LOGIN}
            className="text-[#8A93E5] font-bold hover:text-[#6c77d4] transition-colors"
          >
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
