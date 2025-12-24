import { IUserRepository } from '../../../domain/repositories/iuser-repository';
import { User } from '../../../shared/types';

export class GetUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return await this.userRepository.getAll();
  }
}

