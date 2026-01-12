import { IWorkflowRepository } from '../../../domain/repositories/iworkflow-repository';

export class DeleteWorkflowUseCase {
  constructor(private workflowRepository: IWorkflowRepository) {}

  async execute(id: string): Promise<void> {
    return this.workflowRepository.delete(id);
  }
}
