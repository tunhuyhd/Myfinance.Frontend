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
          <h1 className="text-2xl font-bold text-gray-900">Tiết kiệm</h1>
          <p className="text-sm text-gray-500 mt-1">Lập mục tiêu và tích lũy cho tương lai</p>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mục tiêu</span>
        </button>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 md:p-8 shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-medium text-primary-100">Tổng tiền tích lũy</h2>
            </div>
            <p className="text-4xl font-bold mb-1">{formatCurrency(totalSaved)}</p>
            <p className="text-primary-200 text-sm">Trải đều trên {allGoals?.length || 0} quỹ mục tiêu</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-w-[200px] border border-white/10">
            <p className="text-sm text-primary-200 mb-1">Mục tiêu đang chạy</p>
            <p className="text-xl font-bold mb-3">{formatCurrency(totalTarget)}</p>
            <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-1.5 rounded-full bg-white transition-all duration-1000 ease-out"
                style={{ width: `${totalTarget > 0 ? (activeGoals.reduce((a,c) => a + c.currentAmount, 0) / totalTarget) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'active' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Đang tiết kiệm ({activeGoals.length})
          {activeTab === 'active' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'completed' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
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
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'active' ? 'Chưa có mục tiêu nào' : 'Chưa có mục tiêu hoàn thành'}
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            {activeTab === 'active' 
              ? 'Hãy tạo mục tiêu đầu tiên (Mua xe, Du lịch...) để bắt đầu hành trình tích lũy của bạn.' 
              : 'Khi bạn tích lũy đủ 100% mục tiêu, nó sẽ xuất hiện ở đây như một thành tích đáng tự hào.'}
          </p>
          {activeTab === 'active' && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="text-primary-600 font-medium text-sm hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-6 py-2.5 rounded-xl transition-colors"
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
              className={`bg-white rounded-3xl p-6 border shadow-sm transition-all ${
                isCompleted ? 'border-green-100 bg-green-50/10' : 'border-gray-100 hover:shadow-md'
              } flex flex-col`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
                    style={{ backgroundColor: `${goal.color}15`, color: goal.color }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{goal.name}</h3>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
                      </span>
                    ) : (
                      <p className="text-sm text-gray-500 font-medium">
                        Mục tiêu: {formatCurrency(goal.targetAmount)}
                      </p>
                    )}
                  </div>
                </div>

                {!isCompleted && (
                  <button 
                    onClick={() => setDeletingGoal(goal)}
                    className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa mục tiêu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Progress Section */}
              <div className="mb-6 flex-grow">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className={isCompleted ? 'text-green-600' : 'text-primary-600'}>
                    {formatCurrency(goal.currentAmount)}
                  </span>
                  <span className="text-gray-400">
                    {Math.round(goal.percentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                      isCompleted ? 'bg-green-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Action / Info Section */}
              {isCompleted ? (
                <div className="mt-auto bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-center gap-2 text-green-700 font-medium">
                  <Sparkles className="w-5 h-5" />
                  Bạn đã xuất sắc hoàn thành mục tiêu này!
                </div>
              ) : (
                <div className="mt-auto flex items-center justify-between gap-4">
                  <div className="flex-1">
                    {monthlyTarget !== null ? (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Gợi ý tiết kiệm</p>
                        <p className="font-bold text-gray-900 text-sm">
                          {formatCurrency(monthlyTarget)} <span className="text-xs font-normal text-gray-500">/tháng</span>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Còn thiếu</p>
                        <p className="font-bold text-gray-900 text-sm">
                          {formatCurrency(goal.remainingAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setFundingGoal(goal)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl font-medium hover:bg-primary-100 transition-colors"
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
