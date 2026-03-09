import { Injectable } from '@nestjs/common';
import { DlqRepository } from '../../../../common/dlq/dlq.repository';

/** Failed job жагсаалт авах use case (Admin) */
@Injectable()
export class ListFailedJobsUseCase {
  constructor(private readonly dlqRepository: DlqRepository) {}

  async execute(query: {
    page: number;
    limit: number;
    queueName?: string;
    severity?: string;
    status?: string;
  }) {
    return this.dlqRepository.findMany(query);
  }
}
