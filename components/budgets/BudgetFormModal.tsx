'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetService, CreateBudgetRequest, Budget, UpdateBudgetRequest } from '@/services/budgets.service';
import { categoryService } from '@/services/categories.service';
import { toast } from 'sonner';
import { X, Loader2, Target } from 'lucide-react';
import { useEffect } from 'react';
import { getCategoryIcon } from '@/constants/categories';

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  limitAmount: z.number().min(1000, 'Số tiền tối thiểu 1.000đ'),
});

type FormValues = z.infer<typeof budgetSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  editingBudget?: Budget | null;
}

export function BudgetFormModal({ isOpen, onClose, month, year, editingBudget }: Props) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: '',
      limitAmount: 0,
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 2], // Only Expense categories
    queryFn: () => categoryService.getCategories(2),
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      if (editingBudget) {
        reset({
          categoryId: editingBudget.category.id,
          limitAmount: editingBudget.limitAmount,
        });
      } else {
        reset({
          categoryId: '',
          limitAmount: 0,
        });
      }
    }
  }, [isOpen, editingBudget, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (editingBudget) {
        return budgetService.updateBudget(editingBudget.id, { limitAmount: data.limitAmount });
      } else {
        return budgetService.createBudget({
          categoryId: data.categoryId,
          limitAmount: data.limitAmount,
          month,
          year,
        });
      }
    },
    onSuccess: () => {
      toast.success(editingBudget ? 'Cập nhật ngân sách thành công!' : 'Thêm ngân sách thành công!');
      queryClient.invalidateQueries({ queryKey: ['budgets', month, year] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingBudget ? 'Sửa ngân sách' : 'Tạo ngân sách mới'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Danh mục chi tiêu
            </label>
            <div className="relative">
              <select
                {...register('categoryId')}
                disabled={!!editingBudget}
                className={`w-full pl-4 pr-10 py-3 rounded-xl border ${
                  errors.categoryId ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                } appearance-none bg-white transition-all disabled:bg-gray-50 disabled:text-gray-500`}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Số tiền giới hạn
            </label>
            <div className="relative">
              <input
                {...register('limitAmount', { valueAsNumber: true })}
                type="number"
                placeholder="0"
                className={`w-full px-4 py-3 rounded-xl border font-semibold text-lg text-primary-600 ${
                  errors.limitAmount ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                } transition-all`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">đ</span>
            </div>
            {errors.limitAmount && <p className="mt-1 text-sm text-red-500">{errors.limitAmount.message}</p>}
          </div>

          <div className="pt-4 flex gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm flex items-center justify-center transition-colors disabled:opacity-70"
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu ngân sách'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
