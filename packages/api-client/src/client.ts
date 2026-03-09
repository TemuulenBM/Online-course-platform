import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Library environment-д setTimeout type-ийг declare хийх (DOM/Node lib-ээс хамааралгүй)
declare function setTimeout(callback: () => void, ms: number): unknown;

export interface ApiClientConfig {
  baseURL: string;
  accessToken?: string;
  /** Request timeout миллисекундээр (default: 30000ms) */
  timeout?: number;
  /** Retry тохиргоо */
  retry?: {
    /** Хамгийн их retry тоо (default: 3) */
    maxRetries?: number;
    /** Анхны хүлээх хугацаа ms (default: 1000, exponential backoff ашиглана) */
    baseDelay?: number;
  };
}

// Retry-д ашиглах нэмэлт config талбарууд
interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _retry?: boolean;
}

// Network/server алдаа retry хийх боломжтой эсэхийг шалгах
function isRetryableError(error: AxiosError): boolean {
  // Network алдаа (DNS, timeout, connection refused)
  if (!error.response) return true;
  // 5xx server алдаа, 429 rate limit-ийг retry хийнэ
  const status = error.response.status;
  return status === 429 || (status >= 500 && status <= 599);
}

// Idempotent method-ууд л retry хийнэ (POST давтагдвал side-effect үүсэж болно)
function isIdempotentRequest(config: InternalAxiosRequestConfig): boolean {
  const method = (config.method || 'get').toLowerCase();
  return ['get', 'head', 'options', 'put', 'delete'].includes(method);
}

export class ApiClient {
  private client: AxiosInstance;
  private maxRetries: number;
  private baseDelay: number;

  constructor(config: ApiClientConfig) {
    this.maxRetries = config.retry?.maxRetries ?? 3;
    this.baseDelay = config.retry?.baseDelay ?? 1000;

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.accessToken && {
          Authorization: `Bearer ${config.accessToken}`,
        }),
      },
    });

    this.setupRetryInterceptor();
  }

  // Retry interceptor — exponential backoff + jitter
  private setupRetryInterceptor(): void {
    this.client.interceptors.response.use(undefined, async (error: AxiosError) => {
      const config = error.config as RetryConfig | undefined;
      if (!config) return Promise.reject(error);

      const retryCount = config._retryCount ?? 0;

      // Auth refresh interceptor-ийн retry-г алгасах (_retry flag)
      if (config._retry) return Promise.reject(error);

      if (retryCount < this.maxRetries && isRetryableError(error) && isIdempotentRequest(config)) {
        config._retryCount = retryCount + 1;
        // Exponential backoff + jitter: 1s, 2s, 4s (±25%)
        const jitter = 0.75 + Math.random() * 0.5;
        const delay = this.baseDelay * Math.pow(2, retryCount) * jitter;
        await new Promise<void>((resolve) => setTimeout(resolve, delay));
        return this.client(config);
      }

      return Promise.reject(error);
    });
  }

  setAccessToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  getClient() {
    return this.client;
  }
}
