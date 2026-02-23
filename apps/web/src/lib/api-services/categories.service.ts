import type { ApiResponse, Category } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

export const categoriesService = {
  getTree: async (): Promise<Category[]> => {
    const res = await client.get<ApiResponse<Category[]>>('/categories');
    return res.data.data!;
  },
};
