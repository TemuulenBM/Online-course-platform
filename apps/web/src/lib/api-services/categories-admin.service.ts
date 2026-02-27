import type { ApiResponse, Category } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
  displayOrder?: number;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parentId?: string | null;
  displayOrder?: number;
}

/** Ангилалын admin CRUD үйлдлүүд */
export const categoriesAdminService = {
  create: async (data: CreateCategoryData): Promise<Category> => {
    const res = await client.post<ApiResponse<Category>>('/categories', data);
    return res.data.data!;
  },

  update: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    const res = await client.patch<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/categories/${id}`);
  },

  getById: async (id: string): Promise<Category> => {
    const res = await client.get<ApiResponse<Category>>(`/categories/${id}`);
    return res.data.data!;
  },
};
