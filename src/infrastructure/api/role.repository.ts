import { IRoleRepository, CreateRoleDto, UpdateRoleDto } from '../../domain/repositories/irole-repository';
import { Role } from '../../shared/types';
import { PaginatedResult, PaginationParams } from '../../shared/types/pagination';
import { extractData } from '../../shared/utils/pagination';
import { apiClient } from './api-client';

export class RoleRepository implements IRoleRepository {
  async getAll(pagination?: PaginationParams): Promise<Role[]> {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);
    
    const queryString = params.toString();
    const url = queryString ? `/roles?${queryString}` : '/roles';
    
    const response = await apiClient.get<PaginatedResult<Role> | Role[]>(url);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    
    return extractData(response.results);
  }

  async getById(id: string): Promise<Role> {
    const response = await apiClient.get<Role>(`/roles/${id}`);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const response = await apiClient.post<Role>('/roles', dto);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const response = await apiClient.put<Role>(`/roles/${id}`, dto);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/roles/${id}`);
    if (!response.success) {
      throw new Error(response.message);
    }
  }
}

