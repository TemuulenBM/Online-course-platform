import axios, { AxiosInstance } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  accessToken?: string;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(config.accessToken && {
          Authorization: `Bearer ${config.accessToken}`,
        }),
      },
    });
  }

  setAccessToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  getClient() {
    return this.client;
  }
}
