import { IPermissionRepository } from '../../../domain/repositories/ipermission-repository';
import { Permission } from '../../../shared/types';

export class GetPermissionsUseCase {
  constructor(private permissionRepository: IPermissionRepository) {}

  async execute(): Promise<Permission[]> {
    return await this.permissionRepository.getAll();
  }
}

