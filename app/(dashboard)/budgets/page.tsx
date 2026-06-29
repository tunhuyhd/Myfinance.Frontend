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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ngân sách</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Lập kế hoạch và kiểm soát chi tiêu</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-2 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-800 min-w-[100px] text-center">
            Tháng {selectedMonth}/{selectedYear}
          </span>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-slate-900 rounded-3xl p-7 md:p-8 shadow-xl border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:scale-125 transition-transform duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 text-yellow-500 flex items-center justify-center shadow-inner">
                <Target className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Tổng Ngân sách Tháng {selectedMonth}</h2>
                <p className="text-sm font-medium text-slate-400">Giới hạn chi tiêu tổng thể</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <div className="bg-slate-800/50 backdrop-blur-sm px-5 py-4 rounded-2xl border border-slate-700/50 flex-1 min-w-[140px]">
                <p className="text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">Đã chi tiêu</p>
                <p className={`text-2xl font-bold ${getTextColor(totalPercentage)} tracking-tight`}>
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm px-5 py-4 rounded-2xl border border-slate-700/50 flex-1 min-w-[140px]">
                <p className="text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">Tổng giới hạn</p>
                <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(totalLimit)}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm px-5 py-4 rounded-2xl border border-slate-700/50 flex-1 min-w-[140px]">
                <p className="text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">Còn lại</p>
                <p className="text-2xl font-bold text-slate-300 tracking-tight">{formatCurrency(Math.max(totalLimit - totalSpent, 0))}</p>
              </div>
            </div>
          </div>

          {/* Circle Progress */}
          <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center bg-slate-800/50 rounded-full border border-slate-700/50 shadow-inner p-2">
            <svg className="w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${getProgressColor(totalPercentage).replace('bg-', 'text-')} transition-all duration-1000 ease-out`}
                strokeWidth="3.5"
                strokeDasharray={`${Math.min(totalPercentage, 100)}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${getTextColor(totalPercentage)} tracking-tighter drop-shadow-sm`}>
                {Math.round(totalPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Chi tiết theo Danh mục</h3>
        <div className="flex gap-3">
          {budgets?.length === 0 && (
            <button 
              onClick={() => copyMutation.mutate()}
              disabled={copyMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-70"
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
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-yellow-500 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 hover:scale-105 active:scale-95"
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
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-5 shadow-inner">
            <Target className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Chưa có ngân sách nào</h3>
          <p className="text-sm font-medium text-slate-500 mb-8 max-w-sm mx-auto">Tạo ngân sách cho các danh mục chi tiêu để dễ dàng kiểm soát tài chính của bạn trong tháng này.</p>
          <button 
            onClick={() => {
              setEditingBudget(null);
              setIsFormOpen(true);
            }}
            className="text-slate-900 font-bold text-sm bg-yellow-500 hover:bg-yellow-400 px-6 py-3 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
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
            <div key={budget.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${budget.category.color}15`, color: budget.category.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg tracking-tight">{budget.category.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Đã dùng <span className="text-slate-700">{formatCurrency(budget.spentAmount)}</span> / {formatCurrency(budget.limitAmount)}
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(dropdownOpen === budget.id ? null : budget.id)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  {dropdownOpen === budget.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)}></div>
                      <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95">
                        <button 
                          onClick={() => {
                            setEditingBudget(budget);
                            setIsFormOpen(true);
                            setDropdownOpen(null);
                          }}
                          className="w-full px-4 py-2.5 text-sm font-medium text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <Pencil className="w-4 h-4 text-slate-400" /> Sửa
                        </button>
                        <button 
                          onClick={() => {
                            setDeletingBudget(budget);
                            setIsDeleteDialogOpen(true);
                            setDropdownOpen(null);
                          }}
                          className="w-full px-4 py-2.5 text-sm font-medium text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
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
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className={getTextColor(budget.percentage)}>
                    {Math.round(budget.percentage)}%
                  </span>
                  <span className={isOverLimit ? 'text-red-500' : 'text-slate-500'}>
                    {isOverLimit ? `Vượt quá ${formatCurrency(budget.spentAmount - budget.limitAmount)}` : `Còn lại ${formatCurrency(budget.remainingAmount)}`}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${getProgressColor(budget.percentage)}`}
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
