import { api } from './api';

export interface Category {
  id: string;
  name: string;
  type: number; // 1: Income, 2: Expense
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  type: number;
  icon: string;
  color: string;
}

export interface UpdateCategoryRequest {
  name: string;
  icon: string;
  color: string;
}

export const categoryService = {
  getCategories: async (type?: number): Promise<Category[]> => {
    const response = await api.get('/Categories', { params: { type } });
    return response.data;
  },
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post('/Categories', data);
    return response.data;
  },
  updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await api.put(`/Categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/Categories/${id}`);
  },
};
