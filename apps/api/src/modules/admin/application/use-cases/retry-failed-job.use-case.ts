import { Injectable, NotFoundException } from '@nestjs/common';
import { DlqService } from '../../../../common/dlq/dlq.service';
import { DlqRepository } from '../../../../common/dlq/dlq.repository';

/** Failed job-г дахин оролдох use case (Admin) */
@Injectable()
export class RetryFailedJobUseCase {
  constructor(
    private readonly dlqService: DlqService,
    private readonly dlqRepository: DlqRepository,
  ) {}

  async execute(failedJobId: string) {
    const failedJob = await this.dlqRepository.findById(failedJobId);
    if (!failedJob) {
      throw new NotFoundException('Failed job олдсонгүй');
    }

    await this.dlqService.retryJob(failedJobId);
    return { message: 'Job дахин queue-д нэмэгдлээ' };
  }
}
