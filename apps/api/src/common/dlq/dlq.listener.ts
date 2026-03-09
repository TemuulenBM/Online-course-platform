import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DlqService } from './dlq.service';
import { DLQ_QUEUES } from './dlq.constants';

/**
 * DLQ Listener — бүх Bull queue-д failed event сонсогч бүртгэнэ.
 * onModuleInit() дотор queue.on('failed') callback бүртгэж,
 * бүх retry дууссан job-уудыг DlqService-д дамжуулна.
 */
@Injectable()
export class DlqListenerService implements OnModuleInit {
  private readonly logger = new Logger(DlqListenerService.name);

  /** Queue reference-ийг нэрээр хадгална */
  private readonly queueMap = new Map<string, Queue>();

  constructor(
    @InjectQueue('payments') paymentsQueue: Queue,
    @InjectQueue('certificates') certificatesQueue: Queue,
    @InjectQueue('notifications') notificationsQueue: Queue,
    @InjectQueue('analytics') analyticsQueue: Queue,
    @InjectQueue('admin') adminQueue: Queue,
    @InjectQueue('live-classes') liveClassesQueue: Queue,
    private readonly dlqService: DlqService,
  ) {
    this.queueMap.set('payments', paymentsQueue);
    this.queueMap.set('certificates', certificatesQueue);
    this.queueMap.set('notifications', notificationsQueue);
    this.queueMap.set('analytics', analyticsQueue);
    this.queueMap.set('admin', adminQueue);
    this.queueMap.set('live-classes', liveClassesQueue);
  }

  /**
   * Модуль эхлэхэд бүх queue-д failed event listener бүртгэнэ.
   * Job-ийн attemptsMade >= opts.attempts бол бүх retry дууссан гэж үзнэ.
   */
  onModuleInit() {
    for (const queueName of DLQ_QUEUES) {
      const queue = this.queueMap.get(queueName);
      if (!queue) {
        this.logger.warn(`DLQ: ${queueName} queue олдсонгүй, listener бүртгэгдсэнгүй`);
        continue;
      }

      queue.on('failed', (job, error) => {
        const maxAttempts = job.opts?.attempts ?? 3;
        if (job.attemptsMade >= maxAttempts) {
          // Бүх retry дууссан — DLQ-д оруулах
          this.dlqService.handleDeadLetter(queueName, job, error).catch((err) => {
            this.logger.error(
              `DLQ handleDeadLetter алдаа: ${queueName}/${job.name}`,
              err instanceof Error ? err.stack : String(err),
            );
          });
        }
      });

      this.logger.log(`DLQ listener бүртгэгдлээ: ${queueName}`);
    }
  }
}
