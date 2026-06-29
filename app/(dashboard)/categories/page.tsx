'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryService, Category } from '@/services/categories.service';
import { useState } from 'react';
import { CategoryFormModal } from '@/components/categories/CategoryFormModal';
import { DeleteCategoryDialog } from '@/components/categories/DeleteCategoryDialog';
import { Plus, AlertCircle, Tags, Lock, Edit2, Trash2 } from 'lucide-react';
import { getCategoryIcon } from '@/constants/categories';

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<number>(1); // 1: Income, 2: Expense
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{ id: string, name: string } | null>(null);
  
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories', activeTab],
    queryFn: () => categoryService.getCategories(activeTab),
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory({ id: category.id, name: category.name });
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h1>
          <p className="text-sm text-gray-500 mt-1">Cá nhân hóa các danh mục thu chi của bạn</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-max">
        <button
          onClick={() => setActiveTab(1)}
          className={`flex-1 sm:px-8 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 1 ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Thu tiền (Income)
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`flex-1 sm:px-8 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 2 ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Chi tiền (Expense)
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse border border-gray-50"></div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">Không thể tải danh sách danh mục. Vui lòng thử lại sau.</p>
        </div>
      )}

      {!isLoading && !error && categories?.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
            <Tags className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có danh mục nào</h3>
          <button 
            onClick={handleCreate}
            className="text-primary-600 font-medium text-sm hover:text-primary-700 mt-2"
          >
            Tạo danh mục đầu tiên
          </button>
        </div>
      )}

      {!isLoading && !error && categories && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            
            return (
              <div 
                key={category.id} 
                className="group relative bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="font-semibold text-gray-900 text-sm truncate" title={category.name}>
                  {category.name}
                </h3>
                
                {category.isSystem ? (
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-gray-400">
                    <Lock className="w-3 h-3" />
                    <span>Mặc định</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Tùy chỉnh</span>
                  </div>
                )}

                {/* Actions (Only for custom categories) */}
                {!category.isSystem && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="w-8 h-8 bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center rounded-lg shadow-sm"
                      title="Sửa"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(category)}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center rounded-lg shadow-sm"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <CategoryFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        type={activeTab}
        editingCategory={editingCategory}
      />

      {deletingCategory && (
        <DeleteCategoryDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          categoryId={deletingCategory.id}
          categoryName={deletingCategory.name}
        />
      )}
    </div>
  );
}
