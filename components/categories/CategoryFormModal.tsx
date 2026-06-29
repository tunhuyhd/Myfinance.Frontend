'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, CreateCategoryRequest, UpdateCategoryRequest } from '@/services/categories.service';
import { toast } from 'sonner';
import { Loader2, X, Check } from 'lucide-react';
import { useEffect } from 'react';
import { CATEGORY_COLORS, CATEGORY_ICONS, getCategoryIcon } from '@/constants/categories';

const categorySchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên danh mục'),
  type: z.number(), // 1 = Income, 2 = Expense
  icon: z.string().min(1, 'Vui lòng chọn biểu tượng'),
  color: z.string().min(1, 'Vui lòng chọn màu sắc'),
});

type FormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: number; // The default type for new categories (1 or 2)
  editingCategory?: {
    id: string;
    name: string;
    type: number;
    icon: string;
    color: string;
  } | null;
}

export function CategoryFormModal({ isOpen, onClose, type, editingCategory }: CategoryFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!editingCategory;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type,
      icon: 'help-circle',
      color: CATEGORY_COLORS[0],
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        reset({
          name: editingCategory.name,
          type: editingCategory.type,
          icon: editingCategory.icon,
          color: editingCategory.color,
        });
      } else {
        reset({
          name: '',
          type,
          icon: 'wallet',
          color: CATEGORY_COLORS[0],
        });
      }
    }
  }, [isOpen, editingCategory, type, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateCategoryRequest | UpdateCategoryRequest) => {
      if (isEditing) {
        return categoryService.updateCategory(editingCategory.id, data as UpdateCategoryRequest);
      }
      return categoryService.createCategory(data as CreateCategoryRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(isEditing ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Sửa Danh mục' : 'Thêm Danh mục'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tên danh mục
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="VD: Ăn uống, Lương..."
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'
              } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Màu sắc
            </label>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
            {errors.color && (
              <p className="mt-1 text-sm text-red-500">{errors.color.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Biểu tượng (Icon)
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 h-48 overflow-y-auto p-1">
              {Object.keys(CATEGORY_ICONS).filter(k => k !== 'help-circle').map((iconName) => {
                const Icon = getCategoryIcon(iconName);
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setValue('icon', iconName)}
                    className={`aspect-square flex items-center justify-center rounded-xl transition-all ${
                      isSelected 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
            {errors.icon && (
              <p className="mt-1 text-sm text-red-500">{errors.icon.message}</p>
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
              className={`flex items-center px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-70 bg-primary-600 hover:bg-primary-700`}
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
