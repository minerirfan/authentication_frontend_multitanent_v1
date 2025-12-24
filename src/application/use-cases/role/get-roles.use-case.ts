import { IRoleRepository } from '../../../domain/repositories/irole-repository';
import { Role } from '../../../shared/types';

export class GetRolesUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(): Promise<Role[]> {
    return await this.roleRepository.getAll();
  }
}

