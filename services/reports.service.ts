import { api } from './api';

export interface CategorySummaryDto {
  categoryName: string;
  categoryColor?: string;
  categoryIcon?: string;
  amount: number;
  percentage: number;
}

export interface DailyTrendDto {
  date: string;
  income: number;
  expense: number;
}

export interface DashboardSummaryDto {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  month: number;
  year: number;
  topExpenseCategories: CategorySummaryDto[];
  dailyTrend: DailyTrendDto[];
}

export interface MonthlyReportDto {
  month: number;
  year: number;
  income: number;
  expense: number;
  net: number;
}

export const reportsService = {
  getDashboardSummary: async (month?: number, year?: number): Promise<DashboardSummaryDto> => {
    const params: Record<string, string | number> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/reports/dashboard', { params });
    return response.data;
  },

  getMonthlyReport: async (): Promise<MonthlyReportDto[]> => {
    const response = await api.get('/reports/monthly');
    return response.data;
  },

  getCategoryExpenses: async (month: number, year: number): Promise<CategorySummaryDto[]> => {
    const response = await api.get('/reports/category-expenses', { params: { month, year } });
    return response.data;
  },
};
