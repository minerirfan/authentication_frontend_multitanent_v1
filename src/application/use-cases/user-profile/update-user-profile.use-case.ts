import { IUserProfileRepository, UserProfile, UpdateUserProfileDto } from '../../../infrastructure/api/user-profile.repository';

export class UpdateUserProfileUseCase {
  constructor(private userProfileRepository: IUserProfileRepository) {}

  async execute(userId: string, dto: UpdateUserProfileDto): Promise<UserProfile> {
    return await this.userProfileRepository.update(userId, dto);
  }
}

