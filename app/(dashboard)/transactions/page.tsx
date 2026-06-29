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
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử Giao dịch</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi các khoản thu chi của bạn</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm giao dịch</span>
        </button>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-max">
        <button
          onClick={() => setFilterType(undefined)}
          className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            filterType === undefined ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilterType(1)}
          className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            filterType === 1 ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Thu tiền
        </button>
        <button
          onClick={() => setFilterType(2)}
          className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            filterType === 2 ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Chi tiền
        </button>
        <button
          onClick={() => setFilterType(3)}
          className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            filterType === 3 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có giao dịch nào</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Bạn chưa ghi chép khoản thu hay chi nào. Hãy tạo giao dịch đầu tiên!</p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="text-primary-600 font-medium text-sm hover:text-primary-700 bg-primary-50 px-5 py-2.5 rounded-xl"
          >
            Tạo giao dịch ngay
          </button>
        </div>
      )}

      {!isLoading && !error && transactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                    tx.type === 1 ? 'bg-green-100 text-green-600' : 
                    tx.type === 3 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.type === 1 ? <ArrowUpRight className="w-6 h-6" /> : 
                     tx.type === 3 ? <ArrowRightLeft className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base">{tx.description}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5" />
                        {tx.type === 3 ? `${tx.accountName} ➔ ${tx.toAccountName}` : tx.accountName}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(tx.transactionDate), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                      {tx.categoryName && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">
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
                    tx.type === 3 ? 'text-gray-900' : 'text-gray-900'
                  }`}>
                    {tx.type === 1 ? '+' : tx.type === 3 ? '' : '-'}{formatCurrency(tx.amount)}
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
