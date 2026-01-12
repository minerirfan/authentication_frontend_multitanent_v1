import { IWorkflowRepository } from '../../../domain/repositories/iworkflow-repository';
import { Workflow } from '../../../shared/types';

export class GetWorkflowUseCase {
  constructor(private workflowRepository: IWorkflowRepository) {}

  async execute(id: string): Promise<Workflow> {
    return this.workflowRepository.getById(id);
  }
}
