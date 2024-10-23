import { API_CONFIG } from '@client/services/config.ts';

class ApiService {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string, defaultHeaders: HeadersInit = {}) {
    (this.baseUrl = baseUrl), (this.defaultHeaders = defaultHeaders);
  }

  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      const headers = new Headers(this.defaultHeaders);
      if (options.headers) {
        const customHeaders = new Headers(options.headers);
        customHeaders.forEach((value, key) => {
          headers.set(key, value);
        });
      }

      const config: RequestInit = {
        ...options,
        headers,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.fetchApi<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }
}

export const apiService = new ApiService(
  API_CONFIG.baseUrl,
  API_CONFIG.headers,
);
