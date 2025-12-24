import { IUserProfileRepository, UserProfile } from '../../../infrastructure/api/user-profile.repository';

export class GetUserProfileUseCase {
  constructor(private userProfileRepository: IUserProfileRepository) {}

  async execute(userId: string): Promise<UserProfile | null> {
    return await this.userProfileRepository.getByUserId(userId);
  }
}

