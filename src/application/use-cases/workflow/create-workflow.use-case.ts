import { IWorkflowRepository, CreateWorkflowDto } from '../../../domain/repositories/iworkflow-repository';
import { Workflow } from '../../../shared/types';

export class CreateWorkflowUseCase {
  constructor(private workflowRepository: IWorkflowRepository) {}

  async execute(dto: CreateWorkflowDto): Promise<Workflow> {
    return this.workflowRepository.create(dto);
  }
}
