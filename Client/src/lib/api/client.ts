import { config } from '@/lib/config';

/**
 * API Error class for handling HTTP errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let data: unknown;
    let message = response.statusText;

    try {
      data = await response.json();
      if (typeof data === 'object' && data !== null) {
        const errorData = data as Record<string, unknown>;
        if (typeof errorData.message === 'string') {
          message = errorData.message;
        } else if (typeof errorData.error === 'string') {
          message = errorData.error;
        }
      }
    } catch {
      // Response is not JSON, use status text
    }

    return new ApiError(response.status, response.statusText, message, data);
  }
}

/**
 * Request options for the API client
 */
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Base fetch function with error handling and JSON parsing
 */
async function baseFetch<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers: customHeaders, ...restOptions } = options;

  // Build URL with query params
  const urlWithParams = new URL(url);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        urlWithParams.searchParams.append(key, String(value));
      }
    });
  }

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Build request options
  const requestOptions: RequestInit = {
    ...restOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(urlWithParams.toString(), requestOptions);

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

/**
 * Create an API client for a specific base URL
 */
function createApiClient(baseUrl: string) {
  return {
    get<T>(path: string, options?: RequestOptions): Promise<T> {
      return baseFetch<T>(`${baseUrl}${path}`, { ...options, method: 'GET' });
    },

    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return baseFetch<T>(`${baseUrl}${path}`, { ...options, method: 'POST', body });
    },

    put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return baseFetch<T>(`${baseUrl}${path}`, { ...options, method: 'PUT', body });
    },

    patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return baseFetch<T>(`${baseUrl}${path}`, { ...options, method: 'PATCH', body });
    },

    delete<T>(path: string, options?: RequestOptions): Promise<T> {
      return baseFetch<T>(`${baseUrl}${path}`, { ...options, method: 'DELETE' });
    },
  };
}

/**
 * Strapi API client for CMS operations
 */
export const strapiApi = createApiClient(config.apiUrl);

/**
 * Microservice API client for AI review operations
 */
export const microserviceApi = createApiClient(config.microserviceUrl);

/**
 * Create an authenticated API client with a token
 */
export function withAuth(client: ReturnType<typeof createApiClient>, token: string) {
  const authHeaders = { Authorization: `Bearer ${token}` };

  return {
    get<T>(path: string, options?: RequestOptions): Promise<T> {
      return client.get<T>(path, {
        ...options,
        headers: { ...authHeaders, ...options?.headers },
      });
    },

    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return client.post<T>(path, body, {
        ...options,
        headers: { ...authHeaders, ...options?.headers },
      });
    },

    put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return client.put<T>(path, body, {
        ...options,
        headers: { ...authHeaders, ...options?.headers },
      });
    },

    patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return client.patch<T>(path, body, {
        ...options,
        headers: { ...authHeaders, ...options?.headers },
      });
    },

    delete<T>(path: string, options?: RequestOptions): Promise<T> {
      return client.delete<T>(path, {
        ...options,
        headers: { ...authHeaders, ...options?.headers },
      });
    },
  };
}
