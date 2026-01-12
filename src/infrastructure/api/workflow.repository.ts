import { IWorkflowRepository, CreateWorkflowDto, UpdateWorkflowDto } from '../../domain/repositories/iworkflow-repository';
import { Workflow } from '../../shared/types';
import { PaginatedResult, PaginationParams } from '../../shared/types/pagination';
import { extractData } from '../../shared/utils/pagination';
import { apiClient } from './api-client';

export class WorkflowRepository implements IWorkflowRepository {
  async getAll(pagination?: PaginationParams): Promise<Workflow[]> {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);
    
    const queryString = params.toString();
    const url = queryString ? `/workflows?${queryString}` : '/workflows';
    
    const response = await apiClient.get<PaginatedResult<Workflow> | Workflow[]>(url);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    
    return extractData(response.results);
  }

  async getById(id: string): Promise<Workflow> {
    const response = await apiClient.get<Workflow>(`/workflows/${id}`);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }

  async create(dto: CreateWorkflowDto): Promise<Workflow> {
    const response = await apiClient.post<Workflow>('/workflows', dto);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }

  async update(id: string, dto: UpdateWorkflowDto): Promise<Workflow> {
    const response = await apiClient.put<Workflow>(`/workflows/${id}`, dto);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/workflows/${id}`);
    if (!response.success) {
      throw new Error(response.message);
    }
  }
}
