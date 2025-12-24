import { IAuthRepository, OnboardDto, RegisterDto, LoginDto } from '../../domain/repositories/iauth-repository';
import { AuthResponse } from '../../shared/types';
import { apiClient } from './api-client';

export class AuthRepository implements IAuthRepository {
  async onboard(dto: OnboardDto): Promise<void> {
    const response = await apiClient.post('/auth/onboard', dto);
    if (!response.success) {
      throw new Error(response.message);
    }
  }

  async register(dto: RegisterDto): Promise<void> {
    const response = await apiClient.post('/auth/register', dto);
    if (!response.success) {
      throw new Error(response.message);
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', dto);
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    if (!response.success || !response.results) {
      throw new Error(response.message);
    }
    return response.results;
  }

  async logout(refreshToken: string): Promise<void> {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    if (!response.success) {
      throw new Error(response.message);
    }
  }
}

