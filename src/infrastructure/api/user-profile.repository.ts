import { apiClient } from './api-client';

export interface UserProfile {
  id: string;
  userId: string;
  companyName?: string;
  age?: number;
  cnic?: string;
  mobileNo?: string;
  phoneNo?: string;
  city?: string;
  address?: string;
  whatsappNo?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  dateOfBirth?: string;
  bio?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserProfileDto {
  userId: string;
  companyName?: string;
  age?: number;
  cnic?: string;
  mobileNo?: string;
  phoneNo?: string;
  city?: string;
  address?: string;
  whatsappNo?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  dateOfBirth?: string;
  bio?: string;
  website?: string;
}

export interface UpdateUserProfileDto {
  companyName?: string;
  age?: number;
  cnic?: string;
  mobileNo?: string;
  phoneNo?: string;
  city?: string;
  address?: string;
  whatsappNo?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  dateOfBirth?: string;
  bio?: string;
  website?: string;
}

export interface IUserProfileRepository {
  getByUserId(userId: string): Promise<UserProfile | null>;
  create(dto: CreateUserProfileDto): Promise<UserProfile>;
  update(userId: string, dto: UpdateUserProfileDto): Promise<UserProfile>;
}

export class UserProfileRepository implements IUserProfileRepository {
  async getByUserId(userId: string): Promise<UserProfile | null> {
    const response = await apiClient.get<UserProfile>(`/user-profiles/${userId}`);
    if (response.success && response.results) {
      return response.results as UserProfile;
    }
    return null;
  }

  async create(dto: CreateUserProfileDto): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>(`/user-profiles/${dto.userId}`, dto);
    if (response.success && response.results) {
      return response.results as UserProfile;
    }
    throw new Error('Failed to create user profile');
  }

  async update(userId: string, dto: UpdateUserProfileDto): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>(`/user-profiles/${userId}`, dto);
    if (response.success && response.results) {
      return response.results as UserProfile;
    }
    throw new Error('Failed to update user profile');
  }
}

