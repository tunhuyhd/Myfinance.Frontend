import { api } from './api';

export interface Category {
  id: string;
  name: string;
  type: number; // 1: Income, 2: Expense
  icon: string;
  color: string;
  isSystem: boolean;
}

export const categoryService = {
  getCategories: async (type?: number): Promise<Category[]> => {
    const response = await api.get('/Categories', { params: { type } });
    return response.data;
  },
};
