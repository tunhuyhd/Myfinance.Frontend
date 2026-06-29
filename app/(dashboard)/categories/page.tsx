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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Danh mục</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Cá nhân hóa các danh mục thu chi của bạn</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-slate-900 text-yellow-500 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all flex items-center gap-2 border border-slate-700 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl w-full sm:w-max shadow-inner">
        <button
          onClick={() => setActiveTab(1)}
          className={`flex-1 sm:px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 1 ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Thu tiền (Income)
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`flex-1 sm:px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 2 ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
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
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-5 shadow-inner">
            <Tags className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Chưa có danh mục nào</h3>
          <button 
            onClick={handleCreate}
            className="text-slate-900 font-bold text-sm bg-yellow-500 hover:bg-yellow-400 px-6 py-3 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 mt-4"
          >
            Tạo danh mục đầu tiên
          </button>
        </div>
      )}

      {!isLoading && !error && categories && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            
            return (
              <div 
                key={category.id} 
                className="group relative bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className="font-bold text-slate-900 text-sm truncate tracking-tight" title={category.name}>
                  {category.name}
                </h3>
                
                {category.isSystem ? (
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Mặc định</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Tùy chỉnh</span>
                  </div>
                )}

                {/* Actions (Only for custom categories) */}
                {!category.isSystem && (
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center rounded-xl shadow-sm transition-colors"
                      title="Sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(category)}
                      className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center rounded-xl shadow-sm transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
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
