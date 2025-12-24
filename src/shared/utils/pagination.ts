import { PaginatedResult } from '../types/pagination';

/**
 * Safely extract data array from a response that might be paginated or a plain array
 */
export function extractData<T>(response: PaginatedResult<T> | T[] | undefined | null): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (typeof response === 'object' && 'data' in response) {
    return (response as PaginatedResult<T>).data || [];
  }
  return [];
}

