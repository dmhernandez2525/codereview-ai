/**
 * Organization API functions
 */

import { strapiApi, withAuth } from './client';

import type {
  StrapiResponse,
  Organization,
  OrganizationDashboard,
  OrganizationUsage,
} from './types';

/**
 * Get organization by ID
 */
export async function getOrganization(
  token: string,
  id: number
): Promise<StrapiResponse<Organization>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<Organization>>(`/organizations/${id}`);
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(
  token: string,
  slug: string
): Promise<StrapiResponse<Organization[]>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<Organization[]>>(
    `/organizations?filters[slug][$eq]=${encodeURIComponent(slug)}`
  );
}

/**
 * Get organization dashboard data
 */
export async function getOrganizationDashboard(
  token: string,
  id: number
): Promise<StrapiResponse<OrganizationDashboard>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<OrganizationDashboard>>(`/organizations/${id}/dashboard`);
}

/**
 * Get organization usage statistics
 */
export async function getOrganizationUsage(
  token: string,
  id: number,
  options?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<StrapiResponse<OrganizationUsage>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<OrganizationUsage>>(`/organizations/${id}/usage`, {
    params: {
      startDate: options?.startDate,
      endDate: options?.endDate,
    },
  });
}

/**
 * Create an organization
 */
export async function createOrganization(
  token: string,
  data: {
    name: string;
    slug?: string;
    settings?: Record<string, unknown>;
  }
): Promise<StrapiResponse<Organization>> {
  const api = withAuth(strapiApi, token);
  return api.post<StrapiResponse<Organization>>('/organizations', { data });
}

/**
 * Update an organization
 */
export async function updateOrganization(
  token: string,
  id: number,
  data: Partial<{
    name: string;
    settings: Record<string, unknown>;
  }>
): Promise<StrapiResponse<Organization>> {
  const api = withAuth(strapiApi, token);
  return api.put<StrapiResponse<Organization>>(`/organizations/${id}`, { data });
}
