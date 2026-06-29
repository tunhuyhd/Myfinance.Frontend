import { api } from './api';

export interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  type: number; // 1: Income, 2: Expense, 3: Transfer
  description: string;
  note?: string;
  transactionDate: string;
  toAccountId?: string;
  toAccountName?: string;
}

export interface CreateTransactionRequest {
  accountId: string;
  categoryId?: string;
  amount: number;
  type: number;
  description: string;
  note?: string;
  transactionDate: string;
  toAccountId?: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TransactionFilter {
  page?: number;
  pageSize?: number;
  accountId?: string;
  categoryId?: string;
  type?: number;
  from?: string;
  to?: string;
  search?: string;
}

export const transactionService = {
  getTransactions: async (filter?: TransactionFilter): Promise<PagedResult<Transaction>> => {
    const response = await api.get('/Transactions', { params: filter });
    return response.data;
  },

  createTransaction: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await api.post('/Transactions', data);
    return response.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await api.delete(`/Transactions/${id}`);
  },
};
