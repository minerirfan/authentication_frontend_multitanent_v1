import { AuthResponse } from '../../shared/types';

export interface OnboardDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterDto {
  tenantName: string;
  tenantSlug: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface IAuthRepository {
  onboard(dto: OnboardDto): Promise<void>;
  register(dto: RegisterDto): Promise<void>;
  login(dto: LoginDto): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
  logout(refreshToken: string): Promise<void>;
}

