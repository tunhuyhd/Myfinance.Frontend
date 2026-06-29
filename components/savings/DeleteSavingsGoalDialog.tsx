'use client';

import { Loader2, AlertTriangle, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { savingsService, SavingsGoal } from '@/services/savings.service';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export function DeleteSavingsGoalDialog({ isOpen, onClose, goal }: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => savingsService.deleteSavingsGoal(id),
    onSuccess: () => {
      toast.success('Xóa mục tiêu thành công!');
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  });

  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">Xóa mục tiêu?</h2>
        <p className="text-gray-500 mb-6">
          Bạn có chắc chắn muốn xóa mục tiêu <strong className="text-gray-900">{goal.name}</strong> không? Hành động này không thể hoàn tác.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => mutation.mutate(goal.id)}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-sm flex items-center justify-center transition-colors disabled:opacity-70"
          >
            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xóa ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
