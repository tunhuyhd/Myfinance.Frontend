'use client';

import { useQuery } from '@tanstack/react-query';
import { accountService, Account } from '@/services/accounts.service';
import { Wallet, Plus, MoreHorizontal, AlertCircle, CreditCard, Landmark, Banknote, Smartphone, TrendingUp } from 'lucide-react';
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
      case '1': return <Wallet className="w-6 h-6" />; // Checking/Bank
      case '2': return <Landmark className="w-6 h-6" />; // Savings
      case '3': return <Banknote className="w-6 h-6" />; // Cash
      case '4': return <CreditCard className="w-6 h-6" />; // CreditCard
      case '5': return <TrendingUp className="w-6 h-6" />; // Investment
      case '6': return <Smartphone className="w-6 h-6" />; // EWallet
      default: return <Wallet className="w-6 h-6" />;
    }
  };

  const totalBalance = accounts?.reduce((acc, curr) => acc + curr.balance, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Tài khoản</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Danh sách các ví và tài khoản ngân hàng của bạn</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-slate-900 text-yellow-500 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all flex items-center gap-2 border border-slate-700 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm tài khoản</span>
        </button>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-slate-100 to-white rounded-3xl p-7 shadow-sm border border-slate-200 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <p className="text-sm font-bold text-slate-500 mb-1">Tổng tài sản</p>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{formatCurrency(totalBalance)}</h2>
        </div>
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-slate-900 text-yellow-500 flex items-center justify-center shadow-lg shadow-slate-900/10">
          <Landmark className="w-7 h-7" />
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
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-5 shadow-inner">
            <Wallet className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Chưa có tài khoản nào</h3>
          <p className="text-sm font-medium text-slate-500 mb-8 max-w-sm mx-auto">Hãy tạo tài khoản đầu tiên để bắt đầu ghi chép các giao dịch của bạn.</p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="text-slate-900 font-bold text-sm bg-yellow-500 hover:bg-yellow-400 px-6 py-3 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            Tạo tài khoản ngay
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={dropdownRef}>
        {accounts?.map((account) => (
          <div 
            key={account.id} 
            className="rounded-3xl p-7 shadow-lg relative group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
            style={{ 
              background: account.color ? `linear-gradient(135deg, ${account.color}e6, ${account.color}b3)` : 'linear-gradient(135deg, #0f172a, #1e293b)' 
            }}
          >
            {/* Background pattern mimicking credit card */}
            <div className="absolute -right-6 -top-6 w-32 h-32 border-4 border-white/10 rounded-full"></div>
            <div className="absolute right-12 -top-12 w-24 h-24 border-4 border-white/10 rounded-full"></div>
            
            {account.isDefault && (
              <div className="absolute top-0 right-0 bg-yellow-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-3xl shadow-sm">
                MẶC ĐỊNH
              </div>
            )}
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-white/20 backdrop-blur-md shadow-inner border border-white/20">
                {getAccountIcon(account.accountType)}
              </div>
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(dropdownOpen === account.id ? null : account.id)}
                  className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 backdrop-blur-md transition-colors"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
                
                {dropdownOpen === account.id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95">
                    <button 
                      onClick={() => {
                        setEditingAccount(account);
                        setDropdownOpen(null);
                      }}
                      className="w-full px-4 py-2.5 text-sm font-medium text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-slate-400" />
                      Sửa ví
                    </button>
                    <button 
                      onClick={() => {
                        setDeletingAccount(account);
                        setDropdownOpen(null);
                      }}
                      className="w-full px-4 py-2.5 text-sm font-medium text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa ví
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-medium text-white/80 mb-1 tracking-wide">{account.name}</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(account.balance, account.currency)}</h3>
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
