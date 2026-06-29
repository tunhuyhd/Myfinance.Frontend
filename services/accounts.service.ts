import { api } from './api';

export interface Account {
  id: string;
  name: string;
  accountType: string;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAccountRequest {
  name: string;
  accountType: number;
  initialBalance: number;
  currency: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface UpdateAccountRequest {
  name: string;
  color: string;
  icon: string;
}

export const accountService = {
  getAccounts: async (): Promise<Account[]> => {
    const response = await api.get('/Accounts');
    return response.data;
  },

  getAccount: async (id: string): Promise<Account> => {
    const response = await api.get(`/Accounts/${id}`);
    return response.data;
  },

  createAccount: async (data: CreateAccountRequest): Promise<string> => {
    const response = await api.post('/Accounts', data);
    return response.data;
  },

  updateAccount: async (id: string, data: UpdateAccountRequest): Promise<void> => {
    await api.put(`/Accounts/${id}`, data);
  },

  deleteAccount: async (id: string): Promise<void> => {
    await api.delete(`/Accounts/${id}`);
  },
};
