'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionService, CreateTransactionRequest } from '@/services/transactions.service';
import { accountService } from '@/services/accounts.service';
import { categoryService } from '@/services/categories.service';
import { toast } from 'sonner';
import { Loader2, X, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from 'lucide-react';
import { useEffect } from 'react';

const createTransactionSchema = z.object({
  accountId: z.string().min(1, 'Vui lòng chọn ví'),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  amount: z.number().min(1, 'Số tiền phải lớn hơn 0'),
  type: z.number(), // 1 = Income, 2 = Expense, 3 = Transfer
  description: z.string().min(1, 'Vui lòng nhập mô tả'),
  transactionDate: z.string().min(1, 'Vui lòng chọn ngày'),
}).superRefine((data, ctx) => {
  if (data.type !== 3 && (!data.categoryId || data.categoryId.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn danh mục',
      path: ['categoryId'],
    });
  }
  if (data.type === 3 && (!data.toAccountId || data.toAccountId.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn ví đích',
      path: ['toAccountId'],
    });
  }
  if (data.type === 3 && data.accountId === data.toAccountId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Ví đích phải khác ví nguồn',
      path: ['toAccountId'],
    });
  }
});

type FormValues = z.infer<typeof createTransactionSchema>;

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTransactionModal({ isOpen, onClose }: CreateTransactionModalProps) {
  const queryClient = useQueryClient();

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAccounts,
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: 2, // Mặc định là chi tiêu
      amount: 0,
      transactionDate: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  const selectedType = watch('type');
  
  // Lấy danh mục dựa trên loại Thu/Chi
  const { data: categories } = useQuery({
    queryKey: ['categories', selectedType],
    queryFn: () => categoryService.getCategories(selectedType),
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        type: 2,
        amount: 0,
        transactionDate: new Date().toISOString().split('T')[0],
        description: '',
        accountId: accounts?.find(a => a.isDefault)?.id || (accounts?.[0]?.id ?? ''),
        toAccountId: '',
        categoryId: '',
      });
    }
  }, [isOpen, accounts, reset]);

  // Tự động reset categoryId khi đổi loại Thu/Chi
  useEffect(() => {
    setValue('categoryId', '');
  }, [selectedType, setValue]);

  const mutation = useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionService.createTransaction(data),
    onSuccess: () => {
      // Invalidate both transactions and accounts since balance changed
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Thêm giao dịch thành công!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo giao dịch!');
    },
  });

  const onSubmit = (data: FormValues) => {
    const requestData: CreateTransactionRequest = {
      ...data,
      categoryId: data.categoryId === '' ? undefined : data.categoryId,
      toAccountId: data.toAccountId === '' ? undefined : data.toAccountId,
      transactionDate: new Date(data.transactionDate).toISOString(),
    };
    mutation.mutate(requestData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Thêm Giao dịch</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Transaction Type Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setValue('type', 2)} // Expense
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                selectedType === 2
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Chi tiền
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 1)} // Income
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                selectedType === 1
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Thu tiền
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 3)} // Transfer
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                selectedType === 3
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              Chuyển tiền
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Số tiền
              </label>
              <div className="relative">
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                  className={`w-full px-4 py-2.5 rounded-xl border font-semibold text-lg ${
                    selectedType === 1 ? 'text-green-600' : selectedType === 3 ? 'text-blue-600' : 'text-red-600'
                  } ${
                    errors.amount ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">đ</span>
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ngày giao dịch
              </label>
              <input
                {...register('transactionDate')}
                type="date"
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.transactionDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'
                } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
              />
              {errors.transactionDate && (
                <p className="mt-1 text-sm text-red-500">{errors.transactionDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {selectedType === 3 ? 'Từ Ví (Ví nguồn)' : 'Từ Ví / Nguồn tiền'}
            </label>
            <select
              {...register('accountId')}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.accountId ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'
              } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all bg-white`}
            >
              <option value="">-- Chọn ví giao dịch --</option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({new Intl.NumberFormat('vi-VN').format(account.balance)}đ)
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-sm text-red-500">{errors.accountId.message}</p>
            )}
          </div>

          {selectedType === 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Đến Ví (Ví đích)
              </label>
              <select
                {...register('toAccountId')}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.toAccountId ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'
                } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all bg-white`}
              >
                <option value="">-- Chọn ví đích --</option>
                {accounts?.map((account) => (
                  <option key={`to-${account.id}`} value={account.id}>
                    {account.name} ({new Intl.NumberFormat('vi-VN').format(account.balance)}đ)
                  </option>
                ))}
              </select>
              {errors.toAccountId && (
                <p className="mt-1 text-sm text-red-500">{errors.toAccountId.message}</p>
              )}
            </div>
          )}

          {selectedType !== 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Danh mục
              </label>
              <select
                {...register('categoryId')}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.categoryId ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'
                } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all bg-white`}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mô tả / Diễn giải
            </label>
            <input
              {...register('description')}
              type="text"
              placeholder="VD: Ăn trưa, Nhận lương..."
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'
              } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className={`flex items-center px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-70 ${
                selectedType === 1 ? 'bg-green-600 hover:bg-green-700' : selectedType === 3 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedType === 1 ? 'Lưu khoản thu' : selectedType === 3 ? 'Lưu chuyển khoản' : 'Lưu khoản chi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
