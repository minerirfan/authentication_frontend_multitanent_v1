import { IUserRepository } from '../../../domain/repositories/iuser-repository';
import { User } from '../../../shared/types';

export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    return await this.userRepository.getById(id);
  }
}

