'use client';

import { useQuery } from '@tanstack/react-query';
import { accountService, Account } from '@/services/accounts.service';
import { Wallet, Plus, MoreHorizontal, AlertCircle, CreditCard, Landmark, Banknote } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { CreateAccountModal } from '@/components/accounts/CreateAccountModal';

export default function AccountsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAccounts,
  });

  const getAccountIcon = (type: any) => {
    if (type == null) return <Wallet className="w-6 h-6" />;
    const strType = String(type).toLowerCase();
    switch (strType) {
      case 'cash': 
      case '0': 
        return <Banknote className="w-6 h-6" />;
      case 'creditcard': 
      case '3': 
        return <CreditCard className="w-6 h-6" />;
      case 'savings': 
      case '2': 
        return <Landmark className="w-6 h-6" />;
      default: 
        return <Wallet className="w-6 h-6" />;
    }
  };

  const totalBalance = accounts?.reduce((acc, curr) => acc + curr.balance, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài khoản</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách các ví và tài khoản ngân hàng của bạn</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm tài khoản</span>
        </button>
      </div>

      {/* Overview Card */}
      <div className="glass rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <p className="text-sm font-medium text-gray-500 mb-1">Tổng tài sản</p>
          <h2 className="text-3xl font-bold text-gray-900">{formatCurrency(totalBalance)}</h2>
        </div>
        <div className="relative z-10 w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
          <Landmark className="w-6 h-6" />
        </div>
      </div>

      {/* State Handlers */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse border border-gray-50"></div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">Không thể tải danh sách tài khoản. Vui lòng thử lại sau.</p>
        </div>
      )}

      {/* Account List */}
      {!isLoading && !error && accounts?.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có tài khoản nào</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Hãy tạo tài khoản đầu tiên để bắt đầu ghi chép các giao dịch của bạn.</p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="text-primary-600 font-medium text-sm hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg"
          >
            Tạo tài khoản ngay
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts?.map((account) => (
          <div key={account.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
            {account.isDefault && (
              <div className="absolute top-0 right-0 bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl">
                MẶC ĐỊNH
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: account.color || '#3b82f6' }}
              >
                {getAccountIcon(account.accountType)}
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{account.name}</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(account.balance, account.currency)}</h3>
            </div>
          </div>
        ))}
      </div>

      <CreateAccountModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
