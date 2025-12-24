export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  errors?: string[];
  stackTrace?: string[];
  results?: T;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string | null;
  roles: Array<{
    id: string;
    name: string;
    description: string | null;
    permissions?: Array<{
      id: string;
      name: string;
      resource: string;
      action: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  tenantId: string;
  permissions: Array<{
    id: string;
    name: string;
    resource: string;
    action: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string | null;
    roles: string[];
    permissions: string[];
    isSuperAdmin?: boolean;
  };
}

export * from './pagination';

