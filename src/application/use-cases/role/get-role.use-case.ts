import { IRoleRepository } from '../../../domain/repositories/irole-repository';
import { Role } from '../../../shared/types';

export class GetRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<Role> {
    return await this.roleRepository.getById(id);
  }
}

