import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DlqService } from './dlq.service';
import { DlqListenerService } from './dlq.listener';
import { DlqRepository } from './dlq.repository';

/**
 * DLQ (Dead Letter Queue) модуль.
 * Bull queue-д бүх retry дууссан job-уудыг DB-д хадгалж, admin-д alert илгээнэ.
 *
 * Бүх queue-г registerQueue хийж, failed event listener бүртгэнэ.
 * DlqRepository-г export хийж, Admin module-оос хандах боломжтой.
 */
@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'payments' },
      { name: 'certificates' },
      { name: 'notifications' },
      { name: 'analytics' },
      { name: 'admin' },
      { name: 'live-classes' },
    ),
  ],
  providers: [DlqService, DlqListenerService, DlqRepository],
  exports: [DlqRepository, DlqService],
})
export class DlqModule {}
