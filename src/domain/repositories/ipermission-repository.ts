import { Permission } from '../../shared/types';

export interface IPermissionRepository {
  getAll(): Promise<Permission[]>;
}

