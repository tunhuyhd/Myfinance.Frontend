import { api } from './api';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentage: number;
  deadline?: string;
  icon: string;
  color: string;
  status: number; // 1: Active, 2: Completed, 3: Cancelled
}

export interface CreateSavingsGoalRequest {
  name: string;
  targetAmount: number;
  deadline?: string;
  icon: string;
  color: string;
}

export interface ContributeRequest {
  amount: number;
}

export const savingsService = {
  getSavingsGoals: async (): Promise<SavingsGoal[]> => {
    const response = await api.get<SavingsGoal[]>('/SavingsGoals');
    return response.data;
  },

  createSavingsGoal: async (data: CreateSavingsGoalRequest): Promise<SavingsGoal> => {
    const response = await api.post<SavingsGoal>('/SavingsGoals', data);
    return response.data;
  },

  contributeToGoal: async (id: string, amount: number): Promise<SavingsGoal> => {
    const response = await api.post<SavingsGoal>(`/SavingsGoals/${id}/contribute`, { amount });
    return response.data;
  },

  deleteSavingsGoal: async (id: string): Promise<boolean> => {
    const response = await api.delete<boolean>(`/SavingsGoals/${id}`);
    return response.data;
  }
};
