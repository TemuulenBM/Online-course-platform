import { Injectable, NotFoundException } from '@nestjs/common';
import { DlqRepository } from '../../../../common/dlq/dlq.repository';
import { FAILED_JOB_STATUS } from '../../../../common/dlq/dlq.constants';

/** Failed job-г шийдвэрлэсэн гэж тэмдэглэх use case (Admin) */
@Injectable()
export class ResolveFailedJobUseCase {
  constructor(private readonly dlqRepository: DlqRepository) {}

  async execute(failedJobId: string, adminUserId: string) {
    const failedJob = await this.dlqRepository.findById(failedJobId);
    if (!failedJob) {
      throw new NotFoundException('Failed job олдсонгүй');
    }

    await this.dlqRepository.updateStatus(failedJobId, FAILED_JOB_STATUS.RESOLVED, adminUserId);

    return { message: 'Failed job шийдвэрлэгдсэн гэж тэмдэглэгдлээ' };
  }
}
