import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '../../shared/types';
import { useAuthStore } from '../storage/auth-store';
import { useTenantStore } from '../storage/tenant-store';
import { getApiBaseUrl } from '../config/api.config';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getApiBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token and tenantId for super admin
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add tenantId for super admin if tenant is selected
        const { user } = useAuthStore.getState();
        const { selectedTenant } = useTenantStore.getState();
        const isSuperAdmin = user?.roles?.includes('super_admin') || false;

        if (isSuperAdmin && selectedTenant) {
          // For GET requests, add tenantId as query parameter only if not already present
          if (config.method === 'get') {
            config.params = config.params || {};
            // Only add tenantId if it's not already in the URL or params
            if (!config.params.tenantId && !config.url?.includes('tenantId=')) {
              config.params.tenantId = selectedTenant.id;
            }
          }
          // For POST/PUT requests, add tenantId to request body
          else if (config.data && typeof config.data === 'object') {
            config.data.tenantId = selectedTenant.id;
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = useAuthStore.getState().refreshToken;
            if (refreshToken) {
              const response = await axios.post<ApiResponse>(`${getApiBaseUrl()}/auth/refresh`, {
                refreshToken,
              });

              if (response.data.results) {
                const { accessToken, refreshToken: newRefreshToken } = response.data.results as any;
                useAuthStore.getState().setTokens(accessToken, newRefreshToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return this.client(originalRequest);
              }
            }
          } catch (refreshError) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url);
      return response.data;
    } catch (error) {
      throw this.createError(error);
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      throw this.createError(error);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      throw this.createError(error);
    }
  }

  async delete<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, { data });
      return response.data;
    } catch (error) {
      throw this.createError(error);
    }
  }

  private createError(error: unknown): Error {
    if (error instanceof Error) {
      const axiosError = error as AxiosError<ApiResponse>;

      // If we have a response with our API format
      if (axiosError.response?.data) {
        const apiResponse = axiosError.response.data;

        // Extract error message
        const errorMessage = apiResponse.message ||
          (apiResponse.errors && apiResponse.errors.length > 0
            ? apiResponse.errors[0]
            : 'An error occurred');

        // Create error with proper message
        const customError = new Error(errorMessage);
        (customError as any).statusCode = apiResponse.statusCode || axiosError.response.status;
        (customError as any).errors = apiResponse.errors || [errorMessage];
        (customError as any).response = axiosError.response;
        (customError as any).isAxiosError = true;
        return customError;
      }

      // Network error or other axios error
      if (axiosError.message) {
        const networkError = new Error(
          axiosError.message.includes('Network Error')
            ? 'Network error. Please check your connection.'
            : axiosError.message
        );
        (networkError as any).isAxiosError = true;
        (networkError as any).response = axiosError.response;
        return networkError;
      }
    }

    // Fallback for unknown errors
    return error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}

export const apiClient = new ApiClient();
