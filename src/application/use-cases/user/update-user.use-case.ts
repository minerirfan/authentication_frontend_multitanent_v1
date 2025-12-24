import { IUserRepository, UpdateUserDto } from '../../../domain/repositories/iuser-repository';
import { User } from '../../../shared/types';

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    return await this.userRepository.update(id, dto);
  }
}

