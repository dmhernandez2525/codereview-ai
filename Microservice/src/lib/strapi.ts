import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

import type {
  StrapiResponse,
  StrapiCollectionResponse,
  Organization,
  Repository,
  Review,
  ReviewComment,
  Configuration,
  UsageLog,
} from '../types/index.js';

let isConnected = false;

/**
 * Strapi API client for the Microservice.
 * Handles all communication with the Strapi backend.
 */
class StrapiClient {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = config.strapi.url;
    this.apiToken = config.strapi.apiToken;
  }

  /**
   * Makes an authenticated request to the Strapi API.
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Strapi API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Tests the connection to Strapi.
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to fetch a simple endpoint to verify connection
      await this.request('/organizations?pagination[limit]=1');
      isConnected = true;
      logger.info({ url: this.baseUrl }, 'Strapi connection verified');
      return true;
    } catch (error) {
      isConnected = false;
      logger.error(
        { error: error instanceof Error ? error.message : 'Unknown error', url: this.baseUrl },
        'Strapi connection failed'
      );
      return false;
    }
  }

  /**
   * Returns the current connection status.
   */
  isConnected(): boolean {
    return isConnected;
  }

  // =========================================================================
  // Organization endpoints
  // =========================================================================

  async getOrganization(id: number): Promise<StrapiResponse<Organization>> {
    return this.request(`/organizations/${id}?populate=*`);
  }

  async getOrganizationBySlug(slug: string): Promise<StrapiCollectionResponse<Organization>> {
    return this.request(`/organizations?filters[slug][$eq]=${slug}&populate=*`);
  }

  // =========================================================================
  // Repository endpoints
  // =========================================================================

  async getRepository(id: number): Promise<StrapiResponse<Repository>> {
    return this.request(`/repositories/${id}?populate=*`);
  }

  async getRepositoryByExternalId(
    platform: string,
    externalId: string
  ): Promise<StrapiCollectionResponse<Repository>> {
    return this.request(
      `/repositories?filters[platform][$eq]=${platform}&filters[externalId][$eq]=${externalId}&populate=*`
    );
  }

  async updateRepository(
    id: number,
    data: Partial<Repository>
  ): Promise<StrapiResponse<Repository>> {
    return this.request(`/repositories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  // =========================================================================
  // Review endpoints
  // =========================================================================

  async createReview(data: Partial<Review>): Promise<StrapiResponse<Review>> {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async getReview(id: number): Promise<StrapiResponse<Review>> {
    return this.request(`/reviews/${id}?populate=*`);
  }

  async updateReview(id: number, data: Partial<Review>): Promise<StrapiResponse<Review>> {
    return this.request(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async getReviewByPR(
    repositoryId: number,
    prNumber: number
  ): Promise<StrapiCollectionResponse<Review>> {
    return this.request(
      `/reviews?filters[repository][id][$eq]=${repositoryId}&filters[prNumber][$eq]=${prNumber}&populate=*`
    );
  }

  // =========================================================================
  // Review Comment endpoints
  // =========================================================================

  async createReviewComment(data: Partial<ReviewComment>): Promise<StrapiResponse<ReviewComment>> {
    return this.request('/review-comments', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async createReviewComments(
    comments: Partial<ReviewComment>[]
  ): Promise<StrapiResponse<ReviewComment>[]> {
    // Strapi doesn't have bulk create, so we batch the requests
    return Promise.all(comments.map((comment) => this.createReviewComment(comment)));
  }

  async updateReviewComment(
    id: number,
    data: Partial<ReviewComment>
  ): Promise<StrapiResponse<ReviewComment>> {
    return this.request(`/review-comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  // =========================================================================
  // Configuration endpoints
  // =========================================================================

  async getConfiguration(repositoryId: number): Promise<StrapiCollectionResponse<Configuration>> {
    return this.request(
      `/configurations?filters[repository][id][$eq]=${repositoryId}&sort=createdAt:desc&pagination[limit]=1`
    );
  }

  async createConfiguration(data: Partial<Configuration>): Promise<StrapiResponse<Configuration>> {
    return this.request('/configurations', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  // =========================================================================
  // Usage Log endpoints
  // =========================================================================

  async createUsageLog(data: Partial<UsageLog>): Promise<StrapiResponse<UsageLog>> {
    return this.request('/usage-logs', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async getUsageLogs(
    organizationId: number,
    startDate?: string,
    endDate?: string
  ): Promise<StrapiCollectionResponse<UsageLog>> {
    let endpoint = `/usage-logs?filters[organization][id][$eq]=${organizationId}`;

    if (startDate) {
      endpoint += `&filters[createdAt][$gte]=${startDate}`;
    }
    if (endDate) {
      endpoint += `&filters[createdAt][$lte]=${endDate}`;
    }

    return this.request(endpoint);
  }
}

// Export singleton instance
export const strapiClient = new StrapiClient();
