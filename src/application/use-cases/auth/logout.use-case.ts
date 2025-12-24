import { IAuthRepository } from '../../../domain/repositories/iauth-repository';
import { useAuthStore } from '../../../infrastructure/storage/auth-store';

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        await this.authRepository.logout(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    useAuthStore.getState().logout();
  }
}

