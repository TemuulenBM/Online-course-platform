'use client';

import { Mail, Shield, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';

export function AccountInfo() {
  const t = useTranslations('profile');
  const tr = useTranslations('roles');
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const roleBadgeColor: Record<string, string> = {
    student: 'bg-blue-50 text-blue-600',
    teacher: 'bg-green-50 text-green-600',
    admin: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] p-6">
      <h3 className="text-[17px] font-bold text-gray-900 mb-5">{t('accountInfo')}</h3>

      <div className="space-y-4">
        {/* Имэйл */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 mb-0.5">{t('email')}</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
          </div>
        </div>

        {/* Үүрэг */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-0.5">{t('role')}</p>
            <span
              className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg ${roleBadgeColor[user.role] ?? 'bg-gray-50 text-gray-600'}`}
            >
              {tr(user.role)}
            </span>
          </div>
        </div>

        {/* Бүртгэсэн огноо */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-0.5">{t('memberSince')}</p>
            <p className="text-sm font-semibold text-gray-900">{memberSince}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
