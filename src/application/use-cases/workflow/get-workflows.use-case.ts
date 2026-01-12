import { IWorkflowRepository } from '../../../domain/repositories/iworkflow-repository';
import { Workflow } from '../../../shared/types';
import { PaginationParams } from '../../../shared/types/pagination';

export class GetWorkflowsUseCase {
  constructor(private workflowRepository: IWorkflowRepository) {}

  async execute(pagination?: PaginationParams): Promise<Workflow[]> {
    return this.workflowRepository.getAll(pagination);
  }
}
