'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { savingsService, SavingsGoal } from '@/services/savings.service';
import { toast } from 'sonner';
import { X, Loader2, Plus, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import confetti from 'canvas-confetti';

const addFundsSchema = z.object({
  amount: z.number().min(1000, 'Số tiền tối thiểu 1.000đ'),
});

type FormValues = z.infer<typeof addFundsSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export function AddFundsModal({ isOpen, onClose, goal }: Props) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(addFundsSchema),
    defaultValues: { amount: 0 }
  });

  useEffect(() => {
    if (isOpen) {
      reset({ amount: 0 });
    }
  }, [isOpen, reset]);

  const triggerConfetti = () => {
    const end = Date.now() + 2 * 1000;
    const colors = ['#bb0000', '#ffffff', '#10B981', '#F59E0B'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const mutation = useMutation({
    mutationFn: (data: FormValues) => savingsService.contributeToGoal(goal!.id, data.amount),
    onSuccess: (data) => {
      if (data.status === 2) {
        toast.success(`Tuyệt vời! Bạn đã hoàn thành mục tiêu ${data.name}! 🎉`, { duration: 5000 });
        triggerConfetti();
      } else {
        toast.success(`Đã thêm tiền vào quỹ ${data.name}!`);
      }
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 text-center border border-slate-200">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"
          style={{ backgroundColor: `${goal.color}15`, color: goal.color }}
        >
          <Sparkles className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Gửi tiền vào quỹ</h2>
        <p className="text-slate-500 mb-6 font-medium">{goal.name}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 text-center">
              Nhập số tiền muốn gửi
            </label>
            <div className="relative max-w-xs mx-auto">
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                placeholder="0"
                className={`w-full px-4 py-3 rounded-xl border text-center font-bold text-2xl text-slate-900 bg-slate-50 focus:bg-white ${
                  errors.amount ? 'border-red-300 ring-1 ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20'
                } transition-all`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">đ</span>
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-500 text-center">{errors.amount.message}</p>}
          </div>
          
          <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-sm border border-slate-100">
            <span className="text-slate-500 font-medium">Còn thiếu:</span>
            <span className="font-bold text-slate-900">{formatCurrency(goal.remainingAmount)}</span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-yellow-500 rounded-xl font-bold shadow-md shadow-slate-900/10 flex items-center justify-center transition-all disabled:opacity-70 gap-2 hover:scale-105 active:scale-95"
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Gửi ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
