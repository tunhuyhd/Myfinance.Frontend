'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { savingsService, CreateSavingsGoalRequest } from '@/services/savings.service';
import { toast } from 'sonner';
import { X, Loader2, PiggyBank, Target } from 'lucide-react';
import { useEffect } from 'react';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/constants/categories';

const createSavingsGoalSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên mục tiêu'),
  targetAmount: z.number().min(1000, 'Mục tiêu tối thiểu 1.000đ'),
  deadline: z.string().optional().nullable(),
  icon: z.string().default('piggy-bank'),
  color: z.string().default(CATEGORY_COLORS[0]),
});

type FormValues = z.infer<typeof createSavingsGoalSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SavingsGoalFormModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(createSavingsGoalSchema),
    defaultValues: {
      icon: 'piggy-bank',
      color: CATEGORY_COLORS[0],
      targetAmount: 0,
      name: '',
      deadline: '',
    }
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  useEffect(() => {
    if (isOpen) {
      reset({
        icon: 'piggy-bank',
        color: CATEGORY_COLORS[0],
        targetAmount: 0,
        name: '',
        deadline: '',
      });
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const requestData: CreateSavingsGoalRequest = {
        name: data.name,
        targetAmount: data.targetAmount,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
        icon: data.icon,
        color: data.color,
      };
      return savingsService.createSavingsGoal(requestData);
    },
    onSuccess: () => {
      toast.success('Thêm mục tiêu tiết kiệm thành công!');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Tạo mục tiêu tiết kiệm
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Tên mục tiêu
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="VD: Mua xe máy mới, Đi du lịch..."
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 font-medium ${
                errors.name ? 'border-red-300 ring-1 ring-red-500 bg-red-50' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20'
              } transition-all`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500 font-medium">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Số tiền mục tiêu
              </label>
              <div className="relative">
                <input
                  {...register('targetAmount', { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                  className={`w-full px-4 py-3 rounded-xl border font-bold text-lg text-slate-900 bg-slate-50 focus:bg-white ${
                    errors.targetAmount ? 'border-red-300 ring-1 ring-red-500 bg-red-50' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20'
                  } transition-all`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">đ</span>
              </div>
              {errors.targetAmount && <p className="mt-1 text-sm text-red-500 font-medium">{errors.targetAmount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Ngày hoàn thành (Không bắt buộc)
              </label>
              <input
                {...register('deadline')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 rounded-xl border text-slate-900 bg-slate-50 focus:bg-white font-medium ${
                  errors.deadline ? 'border-red-300 ring-1 ring-red-500 bg-red-50' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20'
                } transition-all`}
              />
              {errors.deadline && <p className="mt-1 text-sm text-red-500 font-medium">{errors.deadline.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Màu sắc</label>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-8 h-8 rounded-full shadow-sm ring-2 ring-offset-2 transition-all ${
                    selectedColor === color ? 'ring-slate-900 scale-110' : 'ring-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Biểu tượng</label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {Object.keys(CATEGORY_ICONS).filter(k => k !== 'help-circle').map((iconName) => {
                const IconComponent = CATEGORY_ICONS[iconName as keyof typeof CATEGORY_ICONS];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setValue('icon', iconName)}
                    className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                      selectedIcon === iconName 
                        ? 'bg-slate-100 text-slate-900 ring-2 ring-slate-900 ring-offset-1 shadow-sm' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-5 flex gap-3 border-t border-slate-100">
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
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-yellow-500 rounded-xl font-bold shadow-md shadow-slate-900/10 flex items-center justify-center transition-all disabled:opacity-70 hover:scale-105 active:scale-95"
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tạo mục tiêu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
