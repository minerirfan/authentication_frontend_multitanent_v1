import { IUserRepository, CreateUserDto } from '../../../domain/repositories/iuser-repository';
import { User } from '../../../shared/types';

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    return await this.userRepository.create(dto);
  }
}

