import { User } from '../../shared/types';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  roleIds?: string[];
}

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User>;
  create(dto: CreateUserDto): Promise<User>;
  update(id: string, dto: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

