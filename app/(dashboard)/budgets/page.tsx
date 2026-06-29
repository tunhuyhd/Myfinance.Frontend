'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService, Budget } from '@/services/budgets.service';
import { getCategoryIcon } from '@/constants/categories';
import { formatCurrency } from '@/lib/utils';
import { 
  Target, ChevronLeft, ChevronRight, Plus, 
  MoreHorizontal, Pencil, Trash2, AlertCircle, Copy, Loader2 
} from 'lucide-react';
import { BudgetFormModal } from '@/components/budgets/BudgetFormModal';
import { DeleteBudgetDialog } from '@/components/budgets/DeleteBudgetDialog';
import { toast } from 'sonner';

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const { data: budgets, isLoading, error } = useQuery({
    queryKey: ['budgets', selectedMonth, selectedYear],
    queryFn: () => budgetService.getBudgets(selectedMonth, selectedYear),
  });

  const copyMutation = useMutation({
    mutationFn: () => budgetService.copyPreviousMonth(selectedMonth, selectedYear),
    onSuccess: (copied) => {
      if (copied) {
        toast.success('Đã sao chép ngân sách từ tháng trước!');
        queryClient.invalidateQueries({ queryKey: ['budgets', selectedMonth, selectedYear] });
      } else {
        toast.error('Không tìm thấy ngân sách nào ở tháng trước để sao chép.');
      }
    },
    onError: () => toast.error('Lỗi khi sao chép ngân sách.')
  });

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const totalLimit = budgets?.reduce((acc, curr) => acc + curr.limitAmount, 0) || 0;
  const totalSpent = budgets?.reduce((acc, curr) => acc + curr.spentAmount, 0) || 0;
  const totalPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  
  const getProgressColor = (pct: number) => {
    if (pct < 50) return 'bg-green-500';
    if (pct < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (pct: number) => {
    if (pct < 50) return 'text-green-600';
    if (pct < 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header & Month Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ngân sách</h1>
          <p className="text-sm text-gray-500 mt-1">Lập kế hoạch và kiểm soát chi tiêu</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-2 py-1.5 rounded-xl border border-gray-200 shadow-sm">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-800 min-w-[100px] text-center">
            Tháng {selectedMonth}/{selectedYear}
          </span>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tổng Ngân sách Tháng {selectedMonth}</h2>
                <p className="text-sm text-gray-500">Giới hạn chi tiêu tổng thể</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Đã chi tiêu</p>
                <p className={`text-2xl font-bold ${getTextColor(totalPercentage)}`}>
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tổng giới hạn</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalLimit)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Còn lại</p>
                <p className="text-2xl font-bold text-gray-600">{formatCurrency(Math.max(totalLimit - totalSpent, 0))}</p>
              </div>
            </div>
          </div>

          {/* Circle Progress */}
          <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${getProgressColor(totalPercentage).replace('bg-', 'text-')} transition-all duration-1000 ease-out`}
                strokeWidth="3"
                strokeDasharray={`${Math.min(totalPercentage, 100)}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-xl font-bold ${getTextColor(totalPercentage)}`}>
                {Math.round(totalPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Chi tiết theo Danh mục</h3>
        <div className="flex gap-3">
          {budgets?.length === 0 && (
            <button 
              onClick={() => copyMutation.mutate()}
              disabled={copyMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70"
            >
              {copyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">Sao chép tháng trước</span>
            </button>
          )}
          <button 
            onClick={() => {
              setEditingBudget(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo ngân sách</span>
          </button>
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse border border-gray-50"></div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">Không thể tải dữ liệu ngân sách. Vui lòng thử lại sau.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && budgets?.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ngân sách nào</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Tạo ngân sách cho các danh mục chi tiêu để dễ dàng kiểm soát tài chính của bạn trong tháng này.</p>
          <button 
            onClick={() => {
              setEditingBudget(null);
              setIsFormOpen(true);
            }}
            className="text-primary-600 font-medium text-sm hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-6 py-2.5 rounded-xl transition-colors"
          >
            Tạo ngân sách đầu tiên
          </button>
        </div>
      )}

      {/* Budget List */}
      <div className="grid grid-cols-1 gap-4">
        {budgets?.map((budget) => {
          const Icon = getCategoryIcon(budget.category.icon);
          const isOverLimit = budget.percentage > 100;
          
          return (
            <div key={budget.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${budget.category.color}15`, color: budget.category.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{budget.category.name}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Đã dùng {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.limitAmount)}
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(dropdownOpen === budget.id ? null : budget.id)}
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  {dropdownOpen === budget.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)}></div>
                      <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in slide-in-from-top-2">
                        <button 
                          onClick={() => {
                            setEditingBudget(budget);
                            setIsFormOpen(true);
                            setDropdownOpen(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" /> Sửa
                        </button>
                        <button 
                          onClick={() => {
                            setDeletingBudget(budget);
                            setIsDeleteDialogOpen(true);
                            setDropdownOpen(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className={getTextColor(budget.percentage)}>
                    {Math.round(budget.percentage)}%
                  </span>
                  <span className={isOverLimit ? 'text-red-500' : 'text-gray-500'}>
                    {isOverLimit ? `Vượt quá ${formatCurrency(budget.spentAmount - budget.limitAmount)}` : `Còn lại ${formatCurrency(budget.remainingAmount)}`}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${getProgressColor(budget.percentage)}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BudgetFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        month={selectedMonth}
        year={selectedYear}
        editingBudget={editingBudget}
      />
      
      <DeleteBudgetDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        budget={deletingBudget}
        month={selectedMonth}
        year={selectedYear}
      />
    </div>
  );
}
