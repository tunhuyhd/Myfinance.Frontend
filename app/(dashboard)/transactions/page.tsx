'use client';

import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactions.service';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { CreateTransactionModal } from '@/components/transactions/CreateTransactionModal';
import { Plus, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Calendar, Wallet, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function TransactionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<number | undefined>(undefined);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', { page: 1, pageSize: 50, type: filterType }],
    queryFn: () => transactionService.getTransactions({ page: 1, pageSize: 50, type: filterType }),
  });

  const transactions = data?.items || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lịch sử Giao dịch</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Theo dõi các khoản thu chi của bạn</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-slate-900 text-yellow-500 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all flex items-center gap-2 border border-slate-700 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm giao dịch</span>
        </button>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-xl w-full sm:w-max shadow-inner">
        <button
          onClick={() => setFilterType(undefined)}
          className={`flex-1 sm:px-6 py-2 rounded-lg text-sm transition-all ${
            filterType === undefined ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 font-medium hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilterType(1)}
          className={`flex-1 sm:px-6 py-2 rounded-lg text-sm transition-all ${
            filterType === 1 ? 'bg-white text-green-600 shadow-sm font-bold' : 'text-slate-500 font-medium hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Thu tiền
        </button>
        <button
          onClick={() => setFilterType(2)}
          className={`flex-1 sm:px-6 py-2 rounded-lg text-sm transition-all ${
            filterType === 2 ? 'bg-white text-red-600 shadow-sm font-bold' : 'text-slate-500 font-medium hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Chi tiền
        </button>
        <button
          onClick={() => setFilterType(3)}
          className={`flex-1 sm:px-6 py-2 rounded-lg text-sm transition-all ${
            filterType === 3 ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 font-medium hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Chuyển khoản
        </button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse border border-gray-50"></div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">Không thể tải danh sách giao dịch. Vui lòng thử lại sau.</p>
        </div>
      )}

      {!isLoading && !error && transactions.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-5 shadow-inner">
            <Wallet className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Chưa có giao dịch nào</h3>
          <p className="text-sm font-medium text-slate-500 mb-8 max-w-sm mx-auto">Bạn chưa ghi chép khoản thu hay chi nào. Hãy tạo giao dịch đầu tiên!</p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="text-slate-900 font-bold text-sm bg-yellow-500 hover:bg-yellow-400 px-6 py-3 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            Tạo giao dịch ngay
          </button>
        </div>
      )}

      {!isLoading && !error && transactions.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${
                    tx.type === 1 ? 'bg-green-50 text-green-600' : 
                    tx.type === 3 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tx.type === 1 ? <ArrowUpRight className="w-6 h-6" /> : 
                     tx.type === 3 ? <ArrowRightLeft className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-900 transition-colors">{tx.description}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-slate-400" />
                        {tx.type === 3 ? `${tx.accountName} ➔ ${tx.toAccountName}` : tx.accountName}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {format(new Date(tx.transactionDate), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                      {tx.categoryName && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-slate-600">
                            {tx.categoryName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`font-bold text-lg ${
                    tx.type === 1 ? 'text-green-600' : 
                    tx.type === 3 ? 'text-slate-900' : 'text-slate-900'
                  }`}>
                    {tx.type === 1 ? '+' : tx.type === 3 ? '' : '-'}{formatCurrency(tx.amount)} <span className="text-sm font-medium text-slate-400">₫</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateTransactionModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
