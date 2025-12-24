import { IRoleRepository, UpdateRoleDto } from '../../../domain/repositories/irole-repository';
import { Role } from '../../../shared/types';

export class UpdateRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(id: string, dto: UpdateRoleDto): Promise<Role> {
    return await this.roleRepository.update(id, dto);
  }
}

