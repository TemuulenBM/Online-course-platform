'use client';

import { cn } from '@/lib/utils';
import type { SystemHealthResponse } from '@/lib/api-services/admin.service';

/** Системийн ажиллагаа widget — live monitoring, 30s auto-refresh */
export function SystemHealthWidget({ health }: { health: SystemHealthResponse | undefined }) {
  const services = [
    {
      name: 'Database (PostgreSQL)',
      status: health?.services.database.status ?? 'error',
      latency: health?.services.database.latencyMs,
    },
    {
      name: 'Redis Cache',
      status: health?.services.redis.status ?? 'error',
      latency: health?.services.redis.latencyMs,
    },
    {
      name: 'MongoDB (Logging)',
      status: health?.services.mongodb.status ?? 'error',
      latency: undefined,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#9c7aff]/5 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#9c7aff]/5 flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900">Системийн ажиллагаа (Health)</h3>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'size-2 rounded-full',
              health?.status === 'ok'
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-rose-500 animate-pulse',
            )}
          />
          <span
            className={cn(
              'text-xs font-medium uppercase tracking-wider',
              health?.status === 'ok' ? 'text-emerald-500' : 'text-rose-500',
            )}
          >
            Live Monitoring
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#9c7aff]/5">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Үйлчилгээ</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Төлөв</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#9c7aff]/5">
            {services.map((svc) => (
              <tr key={svc.name} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{svc.name}</td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={svc.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {svc.latency !== undefined ? (
                    <span
                      className={cn(
                        'font-mono text-sm',
                        svc.latency > 100 ? 'text-rose-500' : 'text-slate-500',
                      )}
                    >
                      {svc.latency}ms
                    </span>
                  ) : svc.status === 'error' ? (
                    <span className="font-mono text-sm text-rose-500">500ms</span>
                  ) : (
                    <span className="font-mono text-sm text-slate-400">&mdash;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Status badge */
function StatusBadge({ status }: { status: 'ok' | 'error' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold',
        status === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
      )}
    >
      <span
        className={cn('size-1.5 rounded-full', status === 'ok' ? 'bg-emerald-500' : 'bg-rose-500')}
      />
      {status === 'ok' ? 'Хэвийн' : 'Алдаатай'}
    </span>
  );
}
