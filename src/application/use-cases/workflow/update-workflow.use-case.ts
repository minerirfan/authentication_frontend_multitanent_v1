import { IWorkflowRepository, UpdateWorkflowDto } from '../../../domain/repositories/iworkflow-repository';
import { Workflow } from '../../../shared/types';

export class UpdateWorkflowUseCase {
  constructor(private workflowRepository: IWorkflowRepository) {}

  async execute(id: string, dto: UpdateWorkflowDto): Promise<Workflow> {
    return this.workflowRepository.update(id, dto);
  }
}
