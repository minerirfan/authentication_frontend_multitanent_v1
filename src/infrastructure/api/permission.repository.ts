import { IPermissionRepository } from '../../domain/repositories/ipermission-repository';
import { Permission } from '../../shared/types';
import { apiClient } from './api-client';

export class PermissionRepository implements IPermissionRepository {
  async getAll(): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>('/permissions');
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }
}

