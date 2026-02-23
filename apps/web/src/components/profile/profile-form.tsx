'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Bell,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Shield,
  SlidersHorizontal,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { User } from '@ocp/shared-types';
import { updateProfileSchema, type UpdateProfileInput } from '@ocp/validation';
import {
  useMyProfile,
  useUpdateProfile,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/lib/constants';
import { toast } from 'sonner';

/** Input талбарын стиль */
const inputBase =
  'w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 text-sm';
const inputFocus = 'focus:border-[#8A93E5] focus:ring-2 focus:ring-[#8A93E5]/20 focus:bg-white';
const inputError = 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200/50';

/** Tab-ийн тодорхойлолт */
const TABS = [
  { key: 'personalInfo', icon: UserIcon },
  { key: 'security', icon: Shield },
  { key: 'preferences', icon: SlidersHorizontal },
] as const;

/** Bio тэмдэгтийн дээд хязгаар */
const BIO_MAX_LENGTH = 500;

export function ProfileForm() {
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const tl = useTranslations('language');
  const user = useAuthStore((s) => s.user);
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState(0);

  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      bio: '',
      country: '',
      timezone: '',
    },
  });

  const bioValue = watch('bio') ?? '';

  /** Профайл ачаалагдсаны дараа формыг populate хийх */
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        bio: profile.bio ?? '',
        country: profile.country ?? '',
        timezone: profile.timezone ?? '',
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: UpdateProfileInput) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        toast.success(t('updateSuccess'));
      },
      onError: () => {
        toast.error(t('updateError'));
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-[#8A93E5]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      {/* Tabs */}
      <div className="border-b border-gray-200 px-6 lg:px-8">
        <div className="flex gap-6">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === i;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#8A93E5] text-[#8A93E5]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(tab.key)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6 lg:p-8">
        {activeTab === 0 && (
          <PersonalInfoTab
            t={t}
            tc={tc}
            user={user}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            errors={errors}
            isDirty={isDirty}
            bioValue={bioValue}
            updateMutation={updateMutation}
            inputBase={inputBase}
            inputFocus={inputFocus}
            inputError={inputError}
          />
        )}
        {activeTab === 1 && <SecurityTab t={t} user={user} />}
        {activeTab === 2 && <PreferencesTab t={t} tl={tl} locale={locale} />}
      </div>
    </div>
  );
}

/** ============= Personal Info Tab ============= */
function PersonalInfoTab({
  t,
  tc,
  user,
  register,
  handleSubmit,
  onSubmit,
  errors,
  isDirty,
  bioValue,
  updateMutation,
  inputBase,
  inputFocus,
  inputError,
}: {
  t: ReturnType<typeof useTranslations<'profile'>>;
  tc: ReturnType<typeof useTranslations<'common'>>;
  user: User | null;
  register: ReturnType<typeof useForm<UpdateProfileInput>>['register'];
  handleSubmit: ReturnType<typeof useForm<UpdateProfileInput>>['handleSubmit'];
  onSubmit: (data: UpdateProfileInput) => void;
  errors: ReturnType<typeof useForm<UpdateProfileInput>>['formState']['errors'];
  isDirty: boolean;
  bioValue: string;
  updateMutation: ReturnType<typeof useUpdateProfile>;
  inputBase: string;
  inputFocus: string;
  inputError: string;
}) {
  return (
    <>
      {/* Section header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{t('accountDetails')}</h3>
        <p className="text-sm text-gray-500 mt-1">{t('accountDetailsSubtitle')}</p>
      </div>

      {updateMutation.error && (
        <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 border border-red-100 mb-5">
          <span className="shrink-0 bg-red-100 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold">
            !
          </span>
          {t('updateError')}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Нэр, Овог — 2 багана */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
              {t('firstName')}
            </label>
            <input
              id="firstName"
              {...register('firstName')}
              placeholder={t('firstName')}
              className={`${inputBase} ${errors.firstName ? inputError : inputFocus}`}
              disabled={updateMutation.isPending}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs font-medium mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
              {t('lastName')}
            </label>
            <input
              id="lastName"
              {...register('lastName')}
              placeholder={t('lastName')}
              className={`${inputBase} ${errors.lastName ? inputError : inputFocus}`}
              disabled={updateMutation.isPending}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs font-medium mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Имэйл — read-only */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-gray-700">
            {t('email')}
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="email"
              type="email"
              value={user?.email ?? ''}
              readOnly
              disabled
              className={`${inputBase} pl-10 bg-gray-100 text-gray-500 cursor-not-allowed`}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{t('emailHelp')}</p>
        </div>

        {/* Намтар + character count */}
        <div className="space-y-1.5">
          <label htmlFor="bio" className="text-sm font-semibold text-gray-700">
            {t('bio')}
          </label>
          <textarea
            id="bio"
            {...register('bio')}
            placeholder={t('bio')}
            rows={4}
            maxLength={BIO_MAX_LENGTH}
            className={`${inputBase} resize-none ${errors.bio ? inputError : inputFocus}`}
            disabled={updateMutation.isPending}
          />
          <div className="flex justify-between items-center">
            {errors.bio ? (
              <p className="text-red-500 text-xs font-medium">{errors.bio.message}</p>
            ) : (
              <span />
            )}
            <p
              className={`text-xs ${bioValue.length > BIO_MAX_LENGTH * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}
            >
              {t('bioCharCount', { count: bioValue.length, max: BIO_MAX_LENGTH })}
            </p>
          </div>
        </div>

        {/* Байршил, Цагийн бүс — 2 багана */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="country" className="text-sm font-semibold text-gray-700">
              {t('country')}
            </label>
            <input
              id="country"
              {...register('country')}
              placeholder={t('country')}
              className={`${inputBase} ${errors.country ? inputError : inputFocus}`}
              disabled={updateMutation.isPending}
            />
            {errors.country && (
              <p className="text-red-500 text-xs font-medium mt-1">{errors.country.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="timezone" className="text-sm font-semibold text-gray-700">
              {t('timezone')}
            </label>
            <input
              id="timezone"
              {...register('timezone')}
              placeholder={t('timezone')}
              className={`${inputBase} ${errors.timezone ? inputError : inputFocus}`}
              disabled={updateMutation.isPending}
            />
            {errors.timezone && (
              <p className="text-red-500 text-xs font-medium mt-1">{errors.timezone.message}</p>
            )}
          </div>
        </div>

        {/* Хадгалах товч + separator */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="bg-[#8A93E5] hover:bg-[#7B8AD4] text-white px-8 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                tc('save')
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

/** ============= Security Tab ============= */
function SecurityTab({
  t,
  user,
}: {
  t: ReturnType<typeof useTranslations<'profile'>>;
  user: User | null;
}) {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{t('securityInfo')}</h3>
      </div>

      <div className="space-y-6">
        {/* Имэйл хаяг — read-only */}
        <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
            <Mail className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{t('email')}</p>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">{t('emailHelp')}</p>
          </div>
        </div>

        {/* Нууц үг солих */}
        <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
            <KeyRound className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{t('changePassword')}</p>
            <p className="text-sm text-gray-500 mt-0.5">{t('changePasswordDesc')}</p>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-[#8A93E5] hover:text-[#7B8AD4] transition-colors"
            >
              {t('goToForgotPassword')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

/** ============= Preferences Tab ============= */
function PreferencesTab({
  t,
  tl,
  locale,
}: {
  t: ReturnType<typeof useTranslations<'profile'>>;
  tl: ReturnType<typeof useTranslations<'language'>>;
  locale: string;
}) {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const updatePrefsMutation = useUpdateNotificationPreferences();

  /** Toggle handler */
  const handleToggle = (field: 'emailEnabled' | 'pushEnabled') => {
    if (!prefs) return;
    const newValue = !prefs[field];
    updatePrefsMutation.mutate(
      { [field]: newValue },
      {
        onSuccess: () => toast.success(t('preferencesUpdated')),
      },
    );
  };

  /** Хэл солих — cookie-д бичнэ */
  const handleLanguageChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    window.location.reload();
  };

  return (
    <>
      {/* Мэдэгдлийн тохиргоо */}
      <div className="mb-8">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">{t('notificationPreferences')}</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#8A93E5]" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email мэдэгдэл */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                  <Bell className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('emailNotifications')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('emailNotificationsDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('emailEnabled')}
                disabled={updatePrefsMutation.isPending}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  prefs?.emailEnabled ? 'bg-[#8A93E5]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    prefs?.emailEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Push мэдэгдэл */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                  <Bell className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('pushNotifications')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('pushNotificationsDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('pushEnabled')}
                disabled={updatePrefsMutation.isPending}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  prefs?.pushEnabled ? 'bg-[#8A93E5]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    prefs?.pushEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Хэл сонголт */}
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">{t('languagePreference')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('languagePreferenceDesc')}</p>
        </div>

        <div className="flex gap-3">
          {[
            { code: 'mn', label: tl('mn') },
            { code: 'en', label: tl('en') },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border transition-all text-sm font-semibold ${
                locale === lang.code
                  ? 'border-[#8A93E5] bg-[#8A93E5]/5 text-[#8A93E5]'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
