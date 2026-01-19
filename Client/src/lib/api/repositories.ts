/**
 * Repository API functions
 */

import { strapiApi, withAuth } from './client';

import type {
  StrapiResponse,
  Repository,
  RepositoryWithStats,
  RepositoryStats,
  RepositoryConfig,
} from './types';

/**
 * Get all repositories for an organization with stats
 */
export async function getRepositoriesByOrganization(
  token: string,
  organizationId: number,
  options?: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }
): Promise<StrapiResponse<RepositoryWithStats[]>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<RepositoryWithStats[]>>(
    `/repositories/by-organization/${organizationId}`,
    {
      params: {
        page: options?.page,
        pageSize: options?.pageSize,
        sort: options?.sort,
      },
    }
  );
}

/**
 * Get a single repository by ID
 */
export async function getRepository(
  token: string,
  id: number
): Promise<StrapiResponse<Repository>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<Repository>>(`/repositories/${id}`);
}

/**
 * Get repository statistics
 */
export async function getRepositoryStats(
  token: string,
  id: number
): Promise<StrapiResponse<RepositoryStats>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<RepositoryStats>>(`/repositories/${id}/stats`);
}

/**
 * Get active configuration for a repository
 */
export async function getRepositoryConfig(
  token: string,
  id: number
): Promise<StrapiResponse<RepositoryConfig>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<RepositoryConfig>>(`/repositories/${id}/config`);
}

/**
 * Toggle repository active state
 */
export async function toggleRepository(
  token: string,
  id: number
): Promise<StrapiResponse<Repository>> {
  const api = withAuth(strapiApi, token);
  return api.put<StrapiResponse<Repository>>(`/repositories/${id}/toggle`);
}

/**
 * Create a new repository
 */
export async function createRepository(
  token: string,
  data: {
    name: string;
    fullName: string;
    platform: string;
    externalId: string;
    defaultBranch?: string;
    organization: number;
  }
): Promise<StrapiResponse<Repository>> {
  const api = withAuth(strapiApi, token);
  return api.post<StrapiResponse<Repository>>('/repositories', { data });
}

/**
 * Update a repository
 */
export async function updateRepository(
  token: string,
  id: number,
  data: Partial<{
    name: string;
    defaultBranch: string;
    isActive: boolean;
    settings: Record<string, unknown>;
  }>
): Promise<StrapiResponse<Repository>> {
  const api = withAuth(strapiApi, token);
  return api.put<StrapiResponse<Repository>>(`/repositories/${id}`, { data });
}

/**
 * Delete a repository
 */
export async function deleteRepository(
  token: string,
  id: number
): Promise<StrapiResponse<Repository>> {
  const api = withAuth(strapiApi, token);
  return api.delete<StrapiResponse<Repository>>(`/repositories/${id}`);
}
