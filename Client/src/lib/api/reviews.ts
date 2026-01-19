/**
 * Reviews API functions
 */

import { strapiApi, withAuth } from './client';

import type {
  StrapiResponse,
  Review,
  ReviewFull,
  ReviewAnalytics,
  ReviewTimeline,
} from './types';

/**
 * Get recent reviews
 */
export async function getRecentReviews(
  token: string,
  options?: {
    limit?: number;
    organizationId?: number;
  }
): Promise<StrapiResponse<Review[]>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<Review[]>>('/reviews/recent', {
    params: {
      limit: options?.limit,
      organizationId: options?.organizationId,
    },
  });
}

/**
 * Get reviews for a repository
 */
export async function getReviewsByRepository(
  token: string,
  repositoryId: number,
  options?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }
): Promise<StrapiResponse<Review[]>> {
  const api = withAuth(strapiApi, token);
  let filters = `filters[repository][id][$eq]=${repositoryId}`;
  if (options?.status) {
    filters += `&filters[status][$eq]=${options.status}`;
  }
  return api.get<StrapiResponse<Review[]>>(
    `/reviews?${filters}&sort=createdAt:desc&pagination[page]=${options?.page || 1}&pagination[pageSize]=${options?.pageSize || 25}&populate=repository`
  );
}

/**
 * Get a single review by ID
 */
export async function getReview(
  token: string,
  id: number
): Promise<StrapiResponse<Review>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<Review>>(`/reviews/${id}?populate=*`);
}

/**
 * Get a review with all comments grouped by file
 */
export async function getReviewFull(
  token: string,
  id: number
): Promise<StrapiResponse<ReviewFull>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<ReviewFull>>(`/reviews/${id}/full`);
}

/**
 * Get analytics for a repository's reviews
 */
export async function getReviewAnalytics(
  token: string,
  repositoryId: number,
  options?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<StrapiResponse<ReviewAnalytics>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<ReviewAnalytics>>(
    `/reviews/analytics/${repositoryId}`,
    {
      params: {
        startDate: options?.startDate,
        endDate: options?.endDate,
      },
    }
  );
}

/**
 * Get timeline data for charts
 */
export async function getReviewTimeline(
  token: string,
  repositoryId: number,
  options?: {
    days?: number;
    groupBy?: 'day' | 'week' | 'month';
  }
): Promise<StrapiResponse<ReviewTimeline>> {
  const api = withAuth(strapiApi, token);
  return api.get<StrapiResponse<ReviewTimeline>>(
    `/reviews/timeline/${repositoryId}`,
    {
      params: {
        days: options?.days,
        groupBy: options?.groupBy,
      },
    }
  );
}
