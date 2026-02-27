'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/constants';
import type { PendingItems } from '@ocp/shared-types';

/** Хүлээгдэж буй үйлдлүүд — clickable, hover анимацтай */
export function PendingActionsWidget({ pending }: { pending: PendingItems | undefined }) {
  const router = useRouter();

  const items = [
    {
      count: pending?.pendingOrders ?? 0,
      label: 'Шинэ захиалга',
      color: 'text-[#9c7aff]',
      href: ROUTES.ADMIN_ORDERS,
    },
    {
      count: pending?.processingOrders ?? 0,
      label: 'Боловсруулж буй',
      color: 'text-amber-500',
      href: ROUTES.ADMIN_ORDERS,
    },
    {
      count: pending?.flaggedPosts ?? 0,
      label: 'Тэмдэглэгдсэн пост',
      color: 'text-rose-500',
      href: ROUTES.ADMIN_MODERATION,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#9c7aff]/5 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#9c7aff]/5">
        <h3 className="font-bold text-lg text-slate-900">Хүлээгдэж буй үйлдлүүд</h3>
      </div>
      <div className="grid grid-cols-3 divide-x divide-[#9c7aff]/10">
        {items.map((item) => (
          <motion.button
            key={item.label}
            onClick={() => router.push(item.href)}
            className="p-8 text-center hover:bg-[#9c7aff]/5 transition-all cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              className={`block text-3xl font-black ${item.color} mb-2`}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.15 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {item.count}
            </motion.span>
            <span className="text-sm font-medium text-slate-600">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
