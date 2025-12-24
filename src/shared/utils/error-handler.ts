import { AxiosError } from 'axios';
import { ApiResponse } from '../types';

/**
 * Extracts error message from axios error response
 * Handles the standard API response format
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check if it's an Axios error with our API response format
    const axiosError = error as AxiosError<ApiResponse>;
    
    if (axiosError.response?.data) {
      const apiResponse = axiosError.response.data;
      
      // Use the message from API response
      if (apiResponse.message) {
        return apiResponse.message;
      }
      
      // Fallback to errors array
      if (apiResponse.errors && apiResponse.errors.length > 0) {
        return apiResponse.errors[0];
      }
    }
    
    // Fallback to error message
    return error.message;
  }
  
  // Fallback for unknown error types
  return 'An unexpected error occurred';
}

/**
 * Extracts all error messages from axios error response
 */
export function getErrorMessages(error: unknown): string[] {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<ApiResponse>;
    
    if (axiosError.response?.data) {
      const apiResponse = axiosError.response.data;
      
      // Return errors array if available
      if (apiResponse.errors && apiResponse.errors.length > 0) {
        return apiResponse.errors;
      }
      
      // Fallback to message
      if (apiResponse.message) {
        return [apiResponse.message];
      }
    }
    
    // Fallback to error message
    return [error.message];
  }
  
  return ['An unexpected error occurred'];
}

/**
 * Gets the status code from error
 */
export function getErrorStatusCode(error: unknown): number | undefined {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return axiosError.response?.status || axiosError.response?.data?.statusCode;
  }
  return undefined;
}

