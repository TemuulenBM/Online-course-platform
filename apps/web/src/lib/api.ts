import { ApiClient } from '@ocp/api-client';

const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
});

export default apiClient;
