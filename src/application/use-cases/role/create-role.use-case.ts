import { IRoleRepository, CreateRoleDto } from '../../../domain/repositories/irole-repository';
import { Role } from '../../../shared/types';

export class CreateRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(dto: CreateRoleDto): Promise<Role> {
    return await this.roleRepository.create(dto);
  }
}

