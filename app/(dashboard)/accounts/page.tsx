'use client';

import { useQuery } from '@tanstack/react-query';
import { accountService, Account } from '@/services/accounts.service';
import { Wallet, Plus, MoreHorizontal, AlertCircle, CreditCard, Landmark, Banknote } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { CreateAccountModal } from '@/components/accounts/CreateAccountModal';
import { EditAccountModal } from '@/components/accounts/EditAccountModal';
import { DeleteAccountDialog } from '@/components/accounts/DeleteAccountDialog';
import { Pencil, Trash2 } from 'lucide-react';

export default function AccountsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={dropdownRef}>
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
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(dropdownOpen === account.id ? null : account.id)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                
                {dropdownOpen === account.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in slide-in-from-top-2">
                    <button 
                      onClick={() => {
                        setEditingAccount(account);
                        setDropdownOpen(null);
                      }}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Sửa ví
                    </button>
                    <button 
                      onClick={() => {
                        setDeletingAccount(account);
                        setDropdownOpen(null);
                      }}
                      className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa ví
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{account.name}</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(account.balance, account.currency)}</h3>
            </div>
          </div>
        ))}
      </div>

      <CreateAccountModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      
      <EditAccountModal 
        isOpen={!!editingAccount} 
        onClose={() => setEditingAccount(null)} 
        account={editingAccount} 
      />
      
      <DeleteAccountDialog 
        isOpen={!!deletingAccount} 
        onClose={() => setDeletingAccount(null)} 
        account={deletingAccount} 
      />
    </div>
  );
}
