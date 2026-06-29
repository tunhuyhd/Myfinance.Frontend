import { api } from './api';
import { Category } from './categories.service';

export interface Budget {
  id: string;
  category: Category;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  month: number;
  year: number;
  percentage: number;
}

export interface CreateBudgetRequest {
  categoryId: string;
  limitAmount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetRequest {
  limitAmount: number;
}

export const budgetService = {
  getBudgets: async (month: number, year: number): Promise<Budget[]> => {
    const response = await api.get<Budget[]>(`/Budgets?month=${month}&year=${year}`);
    return response.data;
  },

  createBudget: async (data: CreateBudgetRequest): Promise<Budget> => {
    const response = await api.post<Budget>('/Budgets', data);
    return response.data;
  },

  updateBudget: async (id: string, data: UpdateBudgetRequest): Promise<Budget> => {
    const response = await api.put<Budget>(`/Budgets/${id}`, data);
    return response.data;
  },

  deleteBudget: async (id: string): Promise<boolean> => {
    const response = await api.delete<boolean>(`/Budgets/${id}`);
    return response.data;
  },

  copyPreviousMonth: async (targetMonth: number, targetYear: number): Promise<boolean> => {
    const response = await api.post<boolean>(`/Budgets/copy?targetMonth=${targetMonth}&targetYear=${targetYear}`);
    return response.data;
  },
};
