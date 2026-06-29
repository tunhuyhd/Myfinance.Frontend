'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionService, CreateTransactionRequest } from '@/services/transactions.service';
import { accountService } from '@/services/accounts.service';
import { categoryService } from '@/services/categories.service';
import { toast } from 'sonner';
import { Loader2, X, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, ChevronDown, Check } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { getCategoryIcon } from '@/constants/categories';

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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const selectedCategoryId = watch('categoryId');
  const selectedCategoryObj = categories?.find(c => c.id === selectedCategoryId);

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
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Thêm Giao dịch</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Transaction Type Toggle */}
          <div className="flex p-1.5 bg-slate-100 rounded-xl shadow-inner">
            <button
              type="button"
              onClick={() => setValue('type', 2)} // Expense
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                selectedType === 2
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Chi tiền
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 1)} // Income
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                selectedType === 1
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Thu tiền
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 3)} // Transfer
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                selectedType === 3
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              Chuyển tiền
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Số tiền
              </label>
              <div className="relative">
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                  className={`w-full px-4 py-3 rounded-xl border font-bold text-lg bg-slate-50 focus:bg-white ${
                    selectedType === 1 ? 'text-green-600' : selectedType === 3 ? 'text-blue-600' : 'text-red-600'
                  } ${
                    errors.amount ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">đ</span>
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500 font-medium">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Ngày giao dịch
              </label>
              <input
                {...register('transactionDate')}
                type="date"
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white font-medium ${
                  errors.transactionDate ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900'
                } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
              />
              {errors.transactionDate && (
                <p className="mt-1 text-sm text-red-500 font-medium">{errors.transactionDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {selectedType === 3 ? 'Từ Ví (Ví nguồn)' : 'Từ Ví / Nguồn tiền'}
            </label>
            <select
              {...register('accountId')}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white font-medium ${
                errors.accountId ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900'
              } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
            >
              <option value="">-- Chọn ví giao dịch --</option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({new Intl.NumberFormat('vi-VN').format(account.balance)}đ)
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-sm text-red-500 font-medium">{errors.accountId.message}</p>
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
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Danh mục
              </label>
              
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between bg-slate-50 transition-all font-medium ${
                  errors.categoryId ? 'border-red-300 ring-1 ring-red-500' : 'border-slate-200 hover:border-slate-300'
                } ${isCategoryOpen ? 'border-slate-900 ring-2 ring-slate-900/20 bg-white' : ''}`}
              >
                {selectedCategoryObj ? (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: `${selectedCategoryObj.color}15`, color: selectedCategoryObj.color }}
                    >
                      {(() => {
                        const Icon = getCategoryIcon(selectedCategoryObj.icon);
                        return <Icon className="w-4 h-4" />;
                      })()}
                    </div>
                    <span className="font-bold text-slate-900">{selectedCategoryObj.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400">-- Chọn danh mục --</span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-auto py-1">
                  {categories?.map((cat) => {
                    const Icon = getCategoryIcon(cat.icon);
                    const isSelected = selectedCategoryId === cat.id;
                    
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setValue('categoryId', cat.id, { shouldValidate: true });
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-slate-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-sm ${isSelected ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                            {cat.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-slate-900" />}
                      </button>
                    );
                  })}
                  {categories?.length === 0 && (
                    <div className="px-4 py-3 text-sm text-slate-500 font-medium text-center">
                      Chưa có danh mục nào
                    </div>
                  )}
                </div>
              )}
              
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-500 font-medium">{errors.categoryId.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Mô tả / Diễn giải
            </label>
            <input
              {...register('description')}
              type="text"
              placeholder="VD: Ăn trưa, Nhận lương..."
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white font-medium ${
                errors.description ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900'
              } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500 font-medium">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className={`flex items-center px-6 py-3 text-sm font-bold text-yellow-500 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md shadow-slate-900/10 hover:scale-105 active:scale-95 disabled:opacity-70`}
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
