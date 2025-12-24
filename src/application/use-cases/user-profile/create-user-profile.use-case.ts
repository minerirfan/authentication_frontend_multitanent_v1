import { IUserProfileRepository, UserProfile, CreateUserProfileDto } from '../../../infrastructure/api/user-profile.repository';

export class CreateUserProfileUseCase {
  constructor(private userProfileRepository: IUserProfileRepository) {}

  async execute(dto: CreateUserProfileDto): Promise<UserProfile> {
    return await this.userProfileRepository.create(dto);
  }
}

