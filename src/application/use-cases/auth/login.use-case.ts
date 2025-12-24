import { IAuthRepository, LoginDto } from '../../../domain/repositories/iauth-repository';
import { useAuthStore } from '../../../infrastructure/storage/auth-store';
import { AuthResponse } from '../../../shared/types';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    const auth = await this.authRepository.login(dto);
    useAuthStore.getState().setAuth(auth);
    return auth;
  }
}

