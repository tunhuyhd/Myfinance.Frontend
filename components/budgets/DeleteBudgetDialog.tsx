'use client';

import { Loader2, AlertTriangle, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService, Budget } from '@/services/budgets.service';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  month: number;
  year: number;
}

export function DeleteBudgetDialog({ isOpen, onClose, budget, month, year }: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: () => {
      toast.success('Xóa ngân sách thành công!');
      queryClient.invalidateQueries({ queryKey: ['budgets', month, year] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  });

  if (!isOpen || !budget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 text-center border border-slate-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Xóa ngân sách?</h2>
        <p className="text-slate-500 font-medium mb-6">
          Bạn có chắc chắn muốn xóa ngân sách cho danh mục <strong className="text-slate-900 font-bold">{budget.category.name}</strong> không? Hành động này không thể hoàn tác.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => mutation.mutate(budget.id)}
            disabled={mutation.isPending}
            className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-md shadow-red-500/20 flex items-center justify-center transition-all disabled:opacity-70 hover:scale-105 active:scale-95"
          >
            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xóa ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
