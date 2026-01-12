import { Workflow } from '../../shared/types';
import { PaginationParams } from '../../shared/types/pagination';

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  type: 'condition' | 'voucher';
  status: 'active' | 'inactive' | 'draft';
  steps: Array<{
    stepNumber: number;
    name: string;
    description?: string;
    actionType: 'approval' | 'notification' | 'calculation' | 'validation';
    config: Record<string, any>;
  }>;
  tenantId?: string;
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  type?: 'condition' | 'voucher';
  status?: 'active' | 'inactive' | 'draft';
  steps?: Array<{
    id?: string;
    stepNumber: number;
    name: string;
    description?: string;
    actionType: 'approval' | 'notification' | 'calculation' | 'validation';
    config: Record<string, any>;
  }>;
}

export interface IWorkflowRepository {
  getAll(pagination?: PaginationParams): Promise<Workflow[]>;
  getById(id: string): Promise<Workflow>;
  create(dto: CreateWorkflowDto): Promise<Workflow>;
  update(id: string, dto: UpdateWorkflowDto): Promise<Workflow>;
  delete(id: string): Promise<void>;
}
