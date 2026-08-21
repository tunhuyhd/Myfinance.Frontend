'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService, UpdateAccountRequest, Account } from '@/services/accounts.service';
import { toast } from 'sonner';
import { Loader2, X, Wallet, Building2, Landmark, CreditCard, ChartPie, Check } from 'lucide-react';
import { useEffect } from 'react';

const editAccountSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên tài khoản'),
  color: z.string(),
  icon: z.string(),
  isDefault: z.boolean().default(false),
});

type FormValues = z.infer<typeof editAccountSchema>;

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#ef4444',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
  '#14b8a6',
];

const ICONS = [
  { id: 'wallet', icon: Wallet },
  { id: 'building', icon: Building2 },
  { id: 'landmark', icon: Landmark },
  { id: 'credit-card', icon: CreditCard },
  { id: 'chart', icon: ChartPie },
];

export function EditAccountModal({ isOpen, onClose, account }: EditAccountModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(editAccountSchema),
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  useEffect(() => {
    if (account && isOpen) {
      reset({
        name: account.name,
        color: account.color,
        icon: account.icon,
        isDefault: account.isDefault,
      });
    }
  }, [account, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateAccountRequest) => accountService.updateAccount(account!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Cập nhật tài khoản thành công!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!');
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sửa tài khoản</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Tên tài khoản
            </label>
            <input
              {...register('name')}
              type="text"
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white ${
                errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900'
              } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all font-medium`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1.5">
                Loại tài khoản (Cố định)
              </label>
              <input
                type="text"
                disabled
                value={
                  account.accountType.toString() === '1' ? 'Ngân hàng / Debit' :
                  account.accountType.toString() === '2' ? 'Tiết kiệm' :
                  account.accountType.toString() === '3' ? 'Tiền mặt' :
                  account.accountType.toString() === '4' ? 'Thẻ tín dụng' :
                  account.accountType.toString() === '5' ? 'Đầu tư' : 'Ví điện tử'
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1.5">
                Số dư hiện tại
              </label>
              <input
                type="text"
                disabled
                value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: account.currency }).format(account.balance)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Màu sắc
            </label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                    selectedColor === color ? 'ring-4 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && <Check className="w-5 h-5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              {...register('isDefault')}
              id="editIsDefault"
              type="checkbox"
              className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
            />
            <label htmlFor="editIsDefault" className="ml-2 block text-sm font-medium text-slate-700">
              Đặt làm tài khoản mặc định
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center px-6 py-3 text-sm font-bold text-yellow-500 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md shadow-slate-900/10 hover:scale-105 active:scale-95 disabled:opacity-70"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
