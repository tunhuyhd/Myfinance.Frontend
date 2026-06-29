'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { savingsService, SavingsGoal } from '@/services/savings.service';
import { getCategoryIcon } from '@/constants/categories';
import { formatCurrency } from '@/lib/utils';
import { 
  Target, Plus, AlertCircle, Loader2, Sparkles, CheckCircle2,
  Trash2, Wallet
} from 'lucide-react';
import { SavingsGoalFormModal } from '@/components/savings/SavingsGoalFormModal';
import { AddFundsModal } from '@/components/savings/AddFundsModal';
import { DeleteSavingsGoalDialog } from '@/components/savings/DeleteSavingsGoalDialog';
import { differenceInMonths, isValid, parseISO } from 'date-fns';

export default function SavingsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [fundingGoal, setFundingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null);

  const { data: allGoals, isLoading, error } = useQuery({
    queryKey: ['savingsGoals'],
    queryFn: () => savingsService.getSavingsGoals(),
  });

  const activeGoals = allGoals?.filter(g => g.status === 1) || [];
  const completedGoals = allGoals?.filter(g => g.status === 2) || [];

  const displayGoals = activeTab === 'active' ? activeGoals : completedGoals;

  const calculateMonthlyTarget = (goal: SavingsGoal) => {
    if (!goal.deadline) return null;
    const deadlineDate = parseISO(goal.deadline);
    if (!isValid(deadlineDate)) return null;

    const monthsLeft = differenceInMonths(deadlineDate, new Date());
    if (monthsLeft <= 0) return goal.remainingAmount; // Due this month or overdue

    return goal.remainingAmount / monthsLeft;
  };

  const totalSaved = allGoals?.reduce((acc, curr) => acc + curr.currentAmount, 0) || 0;
  const totalTarget = activeGoals?.reduce((acc, curr) => acc + curr.targetAmount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tiết kiệm</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Lập mục tiêu và tích lũy cho tương lai</p>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-yellow-500 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mục tiêu</span>
        </button>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-3xl p-7 md:p-8 shadow-xl text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:scale-125 transition-transform duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Wallet className="w-6 h-6 text-yellow-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-300">Tổng tiền tích lũy</h2>
            </div>
            <p className="text-4xl font-bold mb-1 tracking-tight">{formatCurrency(totalSaved)}</p>
            <p className="text-slate-400 text-sm font-medium">Trải đều trên {allGoals?.length || 0} quỹ mục tiêu</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 min-w-[240px] border border-white/10 shadow-inner">
            <p className="text-sm font-bold text-slate-300 mb-1 tracking-wide uppercase">Mục tiêu đang chạy</p>
            <p className="text-2xl font-bold mb-4 tracking-tight text-white">{formatCurrency(totalTarget)}</p>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner border border-slate-700/50">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-1000 ease-out"
                style={{ width: `${totalTarget > 0 ? (activeGoals.reduce((a,c) => a + c.currentAmount, 0) / totalTarget) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-4 px-4 text-sm font-bold transition-colors relative ${
            activeTab === 'active' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Đang tiết kiệm ({activeGoals.length})
          {activeTab === 'active' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-4 px-4 text-sm font-bold transition-colors relative ${
            activeTab === 'completed' ? 'text-green-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Đã hoàn thành ({completedGoals.length})
          {activeTab === 'completed' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* States */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-48 rounded-3xl bg-gray-100 animate-pulse border border-gray-50"></div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">Không thể tải dữ liệu mục tiêu. Vui lòng thử lại sau.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && displayGoals.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-5 shadow-inner">
            <Target className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
            {activeTab === 'active' ? 'Chưa có mục tiêu nào' : 'Chưa có mục tiêu hoàn thành'}
          </h3>
          <p className="text-sm font-medium text-slate-500 mb-8 max-w-sm mx-auto">
            {activeTab === 'active' 
              ? 'Hãy tạo mục tiêu đầu tiên (Mua xe, Du lịch...) để bắt đầu hành trình tích lũy của bạn.' 
              : 'Khi bạn tích lũy đủ 100% mục tiêu, nó sẽ xuất hiện ở đây như một thành tích đáng tự hào.'}
          </p>
          {activeTab === 'active' && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="text-slate-900 font-bold text-sm bg-yellow-500 hover:bg-yellow-400 px-6 py-3 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              Tạo mục tiêu ngay
            </button>
          )}
        </div>
      )}

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayGoals.map((goal) => {
          const IconComponent = getCategoryIcon(goal.icon);
          const monthlyTarget = calculateMonthlyTarget(goal);
          const isCompleted = goal.status === 2;
          
          return (
            <div 
              key={goal.id} 
              className={`bg-white rounded-3xl p-7 border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group ${
                isCompleted ? 'border-green-100 bg-green-50/30' : 'border-slate-200'
              } flex flex-col`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${goal.color}15`, color: goal.color }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{goal.name}</h3>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-md shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thành
                      </span>
                    ) : (
                      <p className="text-xs text-slate-500 font-bold">
                        Mục tiêu: <span className="text-slate-700">{formatCurrency(goal.targetAmount)}</span>
                      </p>
                    )}
                  </div>
                </div>

                {!isCompleted && (
                  <button 
                    onClick={() => setDeletingGoal(goal)}
                    className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors"
                    title="Xóa mục tiêu"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Progress Section */}
              <div className="mb-8 flex-grow">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className={isCompleted ? 'text-green-600' : 'text-slate-900'}>
                    {formatCurrency(goal.currentAmount)}
                  </span>
                  <span className="text-slate-400">
                    {Math.round(goal.percentage)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-900'
                    }`}
                    style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Action / Info Section */}
              {isCompleted ? (
                <div className="mt-auto bg-green-100/50 border border-green-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-green-800 font-bold shadow-sm">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  Bạn đã xuất sắc hoàn thành mục tiêu này!
                </div>
              ) : (
                <div className="mt-auto flex items-center justify-between gap-4">
                  <div className="flex-1">
                    {monthlyTarget !== null ? (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-0.5">Gợi ý tiết kiệm</p>
                        <p className="font-bold text-slate-900 text-sm">
                          {formatCurrency(monthlyTarget)} <span className="text-xs font-medium text-slate-400">/tháng</span>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-0.5">Còn thiếu</p>
                        <p className="font-bold text-slate-900 text-sm">
                          {formatCurrency(goal.remainingAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setFundingGoal(goal)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-slate-900 rounded-xl font-bold hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Cất tiền
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SavingsGoalFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
      
      <AddFundsModal
        isOpen={!!fundingGoal}
        onClose={() => setFundingGoal(null)}
        goal={fundingGoal}
      />

      <DeleteSavingsGoalDialog
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        goal={deletingGoal}
      />
    </div>
  );
}
