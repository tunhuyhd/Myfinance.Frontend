'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService, CreateAccountRequest } from '@/services/accounts.service';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const createAccountSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên tài khoản'),
  accountType: z.coerce.number().min(1, 'Vui lòng chọn loại tài khoản'),
  initialBalance: z.coerce.number().min(0, 'Số dư không hợp lệ'),
  currency: z.string().default('VND'),
  color: z.string().default('#3b82f6'),
  icon: z.string().default('wallet'),
  isDefault: z.boolean().default(false),
});

type FormValues = z.infer<typeof createAccountSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ACCOUNT_TYPES = [
  { id: 1, label: 'Ngân hàng / Debit' },
  { id: 2, label: 'Tiết kiệm' },
  { id: 3, label: 'Tiền mặt' },
  { id: 4, label: 'Thẻ tín dụng' },
  { id: 5, label: 'Đầu tư' },
  { id: 6, label: 'Ví điện tử' },
];

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#ef4444', // Red
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#64748b', // Slate
  '#14b8a6', // Teal
];

export function CreateAccountModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      currency: 'VND',
      color: '#3b82f6',
      icon: 'wallet',
      initialBalance: 0,
      isDefault: false
    }
  });

  const selectedColor = watch('color');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateAccountRequest) => accountService.createAccount(data),
    onSuccess: () => {
      toast.success('Thêm tài khoản thành công!');
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  });

  const onSubmit = (data: FormValues) => {
    const requestData: CreateAccountRequest = {
      name: data.name,
      accountType: data.accountType,
      initialBalance: data.initialBalance,
      currency: data.currency,
      color: data.color,
      icon: data.icon,
      isDefault: data.isDefault,
    };
    mutation.mutate(requestData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Thêm tài khoản mới</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Tên tài khoản
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="VD: Ví tiền mặt, VCB cá nhân..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all font-medium"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500 font-medium">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Loại tài khoản
              </label>
              <select
                {...register('accountType')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all font-medium"
              >
                <option value="">Chọn loại</option>
                {ACCOUNT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
              {errors.accountType && <p className="mt-1 text-sm text-red-500 font-medium">{errors.accountType.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Số dư ban đầu
              </label>
              <input
                {...register('initialBalance')}
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all font-medium"
              />
              {errors.initialBalance && <p className="mt-1 text-sm text-red-500 font-medium">{errors.initialBalance.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Màu sắc
            </label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-9 h-9 rounded-full shadow-sm ring-2 ring-offset-2 transition-all ${
                    selectedColor === color ? 'ring-slate-900 scale-110' : 'ring-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center mt-2">
            <input
              id="isDefault"
              type="checkbox"
              {...register('isDefault')}
              className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm font-medium text-slate-700">
              Đặt làm tài khoản mặc định
            </label>
          </div>

          <div className="pt-5 flex gap-3 border-t border-slate-100 mt-6">
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
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
