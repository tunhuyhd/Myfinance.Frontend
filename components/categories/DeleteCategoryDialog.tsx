'use client';

import { Loader2, AlertTriangle, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/categories.service';
import { toast } from 'sonner';

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
}

export function DeleteCategoryDialog({ isOpen, onClose, categoryId, categoryName }: DeleteCategoryDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => categoryService.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // Invalidate transactions too since their category will be set to null
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Xóa danh mục thành công!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa danh mục!');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Xóa danh mục?</h2>
          <p className="text-sm font-medium text-slate-500 mb-1">
            Bạn có chắc chắn muốn xóa danh mục <span className="font-bold text-slate-900">"{categoryName}"</span>?
          </p>
          <p className="text-xs text-orange-600 font-medium">
            (Các giao dịch liên quan sẽ không bị xóa mà chỉ mất đi nhãn danh mục)
          </p>
        </div>

        <div className="flex justify-end gap-3 p-5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors shadow-sm"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-70 bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 hover:scale-105 active:scale-95"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xóa ngay
          </button>
        </div>
      </div>
    </div>
  );
}
