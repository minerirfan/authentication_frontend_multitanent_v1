import { Role } from '../../shared/types';

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface IRoleRepository {
  getAll(): Promise<Role[]>;
  getById(id: string): Promise<Role>;
  create(dto: CreateRoleDto): Promise<Role>;
  update(id: string, dto: UpdateRoleDto): Promise<Role>;
  delete(id: string): Promise<void>;
}

