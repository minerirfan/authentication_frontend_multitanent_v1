import { IUserRepository, CreateUserDto, UpdateUserDto } from '../../domain/repositories/iuser-repository';
import { User } from '../../shared/types';
import { PaginatedResult, PaginationParams } from '../../shared/types/pagination';
import { extractData } from '../../shared/utils/pagination';
import { apiClient } from './api-client';

export class UserRepository implements IUserRepository {
  async getAll(pagination?: PaginationParams): Promise<User[]> {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);
    
    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    
    const response = await apiClient.get<PaginatedResult<User> | User[]>(url);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    
    return extractData(response.results);
  }

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const response = await apiClient.post<User>('/users', dto);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, dto);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/${id}`);
    if (!response.success) {
      throw new Error(response.message);
    }
  }
}

