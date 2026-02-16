import { ApiClient } from '@ocp/api-client';

const apiClient = new ApiClient({
  baseURL: 'http://localhost:3001/api/v1',
});

export default apiClient;
