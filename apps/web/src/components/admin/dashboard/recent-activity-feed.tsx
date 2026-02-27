'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UserPlus,
  CreditCard,
  Award,
  AlertCircle,
  KeyRound,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  Edit,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/utils/format-time-ago';
import type { AuditLogEntry } from '@/lib/api-services/admin.service';

/** Action type-аас icon болон өнгө тодорхойлох */
function getActivityMeta(action: string, entityType: string) {
  const key = `${action}:${entityType}`.toLowerCase();

  if (key.includes('create') && entityType.toLowerCase().includes('user'))
    return { icon: UserPlus, bg: 'bg-[#9c7aff]/10', color: 'text-[#9c7aff]' };
  if (action === 'CREATE' && entityType.includes('ORDER'))
    return { icon: CreditCard, bg: 'bg-amber-100', color: 'text-amber-600' };
  if (action === 'APPROVE')
    return { icon: CheckCircle, bg: 'bg-emerald-100', color: 'text-emerald-600' };
  if (action === 'REJECT') return { icon: XCircle, bg: 'bg-rose-100', color: 'text-rose-600' };
  if (entityType.includes('CERTIFICATE'))
    return { icon: Award, bg: 'bg-emerald-100', color: 'text-emerald-600' };
  if (action === 'DELETE') return { icon: Trash2, bg: 'bg-rose-100', color: 'text-rose-600' };
  if (action === 'UPDATE' && entityType.includes('SETTING'))
    return { icon: Settings, bg: 'bg-blue-100', color: 'text-blue-600' };
  if (action === 'UPDATE') return { icon: Edit, bg: 'bg-blue-100', color: 'text-blue-600' };
  if (entityType.includes('PASSWORD'))
    return { icon: KeyRound, bg: 'bg-slate-100', color: 'text-slate-600' };

  return { icon: AlertCircle, bg: 'bg-rose-100', color: 'text-rose-600' };
}

/** Монгол action тайлбар */
function getActivityDescription(action: string, entityType: string): string {
  const et = entityType.replace(/_/g, ' ').toLowerCase();
  const actionMap: Record<string, string> = {
    CREATE: 'Шинэ',
    UPDATE: 'Шинэчлэлт:',
    DELETE: 'Устгалт:',
    APPROVE: 'Баталгаажууллаа:',
    REJECT: 'Татгалзлаа:',
  };
  return `${actionMap[action] ?? action} ${et}`;
}

/** Сүүлийн үйл ажиллагааны жагсаалт — slide-in анимацтай */
export function RecentActivityFeed({ activities }: { activities: AuditLogEntry[] | undefined }) {
  return (
    <div className="bg-white rounded-2xl border border-[#9c7aff]/5 shadow-sm h-full flex flex-col">
      <div className="p-6 border-b border-[#9c7aff]/5 flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900">Сүүлийн үйл ажиллагаа</h3>
        <Link
          href={ROUTES.ADMIN_AUDIT_LOGS}
          className="text-[#9c7aff] text-sm font-bold hover:underline"
        >
          Бүгдийг харах
        </Link>
      </div>
      <div className="p-6 flex-1 space-y-5 overflow-y-auto">
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => {
            const meta = getActivityMeta(activity.action, activity.entityType);
            const Icon = meta.icon;

            return (
              <motion.div
                key={activity.id}
                className="flex gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
              >
                <div
                  className={`size-8 rounded-full ${meta.bg} flex items-center justify-center ${meta.color} shrink-0`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {getActivityDescription(activity.action, activity.entityType)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {formatTimeAgo(activity.createdAt)}
                    {activity.userEmail && ` • ${activity.userEmail}`}
                  </p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">Үйл ажиллагаа байхгүй</p>
        )}
      </div>
    </div>
  );
}
