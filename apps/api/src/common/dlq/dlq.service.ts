import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { DlqRepository } from './dlq.repository';
import { RedisService } from '../redis/redis.service';
import {
  QUEUE_SEVERITY,
  ALERT_SEVERITIES,
  ALERT_RATE_LIMIT_TTL,
  FAILED_JOB_STATUS,
  DlqQueueName,
} from './dlq.constants';
import { PrismaService } from '../prisma/prisma.service';

/**
 * DLQ Service — Dead Letter Queue гол логик.
 * Failed job хадгалах, admin-д alert илгээх, retry хийх.
 */
@Injectable()
export class DlqService {
  private readonly logger = new Logger(DlqService.name);

  /** Queue reference-ийг нэрээр олохын тулд хадгална */
  private readonly queueMap = new Map<string, Queue>();

  constructor(
    private readonly dlqRepository: DlqRepository,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    @InjectQueue('payments') paymentsQueue: Queue,
    @InjectQueue('certificates') certificatesQueue: Queue,
    @InjectQueue('notifications') notificationsQueue: Queue,
    @InjectQueue('analytics') analyticsQueue: Queue,
    @InjectQueue('admin') adminQueue: Queue,
    @InjectQueue('live-classes') liveClassesQueue: Queue,
  ) {
    this.queueMap.set('payments', paymentsQueue);
    this.queueMap.set('certificates', certificatesQueue);
    this.queueMap.set('notifications', notificationsQueue);
    this.queueMap.set('analytics', analyticsQueue);
    this.queueMap.set('admin', adminQueue);
    this.queueMap.set('live-classes', liveClassesQueue);
  }

  /**
   * Dead letter job боловсруулах.
   * 1. DB-д хадгалах
   * 2. CRITICAL/HIGH бол admin-д alert
   * 3. Audit log бүртгэх
   */
  async handleDeadLetter(queueName: string, job: Job, error: Error): Promise<void> {
    const severity = QUEUE_SEVERITY[queueName as DlqQueueName] || 'MEDIUM';

    try {
      // 1. DB-д хадгалах
      const failedJob = await this.dlqRepository.create({
        queueName,
        jobName: job.name || 'unknown',
        jobId: String(job.id),
        jobData: job.data as Record<string, unknown>,
        errorMessage: error.message,
        errorStack: error.stack,
        attemptsMade: job.attemptsMade,
        severity,
      });

      this.logger.error(
        `DLQ: ${queueName}/${job.name} job бүрмөсөн амжилтгүй (${job.attemptsMade} оролдлого). ` +
          `Severity: ${severity}. ID: ${failedJob.id}`,
      );

      // 2. CRITICAL/HIGH бол admin-д alert
      if (ALERT_SEVERITIES.includes(severity)) {
        await this.alertAdmins(queueName, job, severity, failedJob.id);
      }

      // 3. Audit log (admin queue-ээр, DLQ-ийн өөрийнх нь бүртгэл биш шууд DB)
      await this.logAudit(failedJob.id, queueName, job.name || 'unknown', severity);
    } catch (err) {
      // DLQ өөрөө fail болохоос хамгаалах — зөвхөн log
      this.logger.error(
        `DLQ боловсруулалт амжилтгүй: ${queueName}/${job.name}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  /**
   * Failed job-г дахин queue-д нэмэх.
   * Original queue олж, ижил job data-тай шинэ job үүсгэнэ.
   */
  async retryJob(failedJobId: string): Promise<void> {
    const failedJob = await this.dlqRepository.findById(failedJobId);
    if (!failedJob) {
      throw new Error(`Failed job олдсонгүй: ${failedJobId}`);
    }

    const queue = this.queueMap.get(failedJob.queueName);
    if (!queue) {
      throw new Error(`Queue олдсонгүй: ${failedJob.queueName}`);
    }

    await queue.add(failedJob.jobName, failedJob.jobData);
    await this.dlqRepository.updateStatus(failedJobId, FAILED_JOB_STATUS.RETRIED);

    this.logger.log(
      `DLQ retry: ${failedJob.queueName}/${failedJob.jobName} дахин queue-д нэмэгдлээ`,
    );
  }

  /**
   * Admin-д alert илгээх (IN_APP notification шууд DB-д бичнэ).
   * NotificationService ашиглахгүй — infinite loop-аас хамгаална.
   * Rate limit: queue тус бүрд 5 минутад 1 alert.
   */
  private async alertAdmins(
    queueName: string,
    job: Job,
    severity: string,
    failedJobId: string,
  ): Promise<void> {
    try {
      // Rate limit шалгах
      const rateLimitKey = `dlq:alert:${queueName}`;
      const existing = await this.redisService.get(rateLimitKey);
      if (existing) {
        this.logger.debug(
          `DLQ alert rate limit: ${queueName} — 5 минутын дотор аль хэдийн илгээгдсэн`,
        );
        return;
      }

      // ADMIN role-тэй хэрэглэгчдийг олох
      const admins = await this.prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      if (admins.length === 0) return;

      // IN_APP notification шууд DB-д бичих (queue ашиглахгүй — infinite loop хамгаалалт)
      const title = `⚠️ ${severity} — Queue job амжилтгүй`;
      const message =
        `${queueName}/${job.name || 'unknown'} job ${job.attemptsMade} удаа оролдсон ч амжилтгүй болсон. ` +
        `Алдаа: ${job.failedReason || 'Тодорхойгүй'}`;

      await this.prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: 'IN_APP',
          title,
          message,
          data: { failedJobId, queueName, severity },
        })),
      });

      // Rate limit key тохируулах
      await this.redisService.set(rateLimitKey, '1', ALERT_RATE_LIMIT_TTL);

      this.logger.warn(`DLQ alert: ${admins.length} admin-д мэдэгдэл илгээгдлээ (${queueName})`);
    } catch (err) {
      // Alert илгээх алдаа нь DLQ бүртгэлийг зогсоохгүй
      this.logger.error(
        'DLQ admin alert илгээхэд алдаа гарлаа',
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  /** Audit log шууд DB-д бичих (admin queue ашиглахгүй — DLQ loop хамгаалалт) */
  private async logAudit(
    failedJobId: string,
    queueName: string,
    jobName: string,
    severity: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: 'SYSTEM',
          action: 'JOB_FAILED_PERMANENTLY',
          entityType: 'FailedJob',
          entityId: failedJobId,
          metadata: { queueName, jobName, severity },
        },
      });
    } catch (err) {
      this.logger.error(
        'DLQ audit log бичихэд алдаа',
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
