/**
 * DLQ (Dead Letter Queue) тогтмол утгууд.
 * Queue нэрс болон severity mapping.
 */

/** Bull Queue нэрс — DLQ listener бүртгэх queue-ууд */
export const DLQ_QUEUES = [
  'payments',
  'certificates',
  'notifications',
  'analytics',
  'admin',
  'live-classes',
] as const;

export type DlqQueueName = (typeof DLQ_QUEUES)[number];

/** Queue тус бүрийн severity (ноцтой байдал) */
export const QUEUE_SEVERITY: Record<DlqQueueName, string> = {
  payments: 'CRITICAL',
  certificates: 'CRITICAL',
  'live-classes': 'HIGH',
  notifications: 'MEDIUM',
  analytics: 'LOW',
  admin: 'LOW',
};

/** Alert илгээх severity-ууд (CRITICAL, HIGH) */
export const ALERT_SEVERITIES = ['CRITICAL', 'HIGH'];

/** Alert rate limit TTL (секунд) — queue тус бүрд 5 минутад 1 alert */
export const ALERT_RATE_LIMIT_TTL = 300;

/** Failed job статус */
export const FAILED_JOB_STATUS = {
  PENDING: 'PENDING',
  RETRIED: 'RETRIED',
  RESOLVED: 'RESOLVED',
  IGNORED: 'IGNORED',
} as const;
