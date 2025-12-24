/**
 * API Configuration
 * Manages API version and base URL configuration
 */

// Get API version from environment variable or default to v1
export const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

/**
 * Get the base URL for API requests
 * @returns Base URL with version (e.g., '/api/v1')
 */
export function getApiBaseUrl(): string {
  return `/api/${API_VERSION}`;
}

/**
 * Get the full API version string
 * @returns API version (e.g., 'v1')
 */
export function getApiVersion(): string {
  return API_VERSION;
}

