'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown, LayoutDashboard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  const { data: monthlyReports, isLoading } = useQuery({
    queryKey: ['reports', 'monthly'],
    queryFn: reportsService.getMonthlyReport,
  });

  const availableReports = [...(monthlyReports || [])].sort(
    (a, b) => b.year - a.year || b.month - a.month
  );
  const activePeriod = selectedPeriod || (availableReports[0]
    ? `${availableReports[0].year}-${availableReports[0].month}`
    : null);
  const [selectedYear, selectedMonth] = activePeriod?.split('-').map(Number) || [];
  const selectedReport = monthlyReports?.find(
    report => report.month === selectedMonth && report.year === selectedYear
  );

  const { data: categoryExpenses, isLoading: isCategoryLoading } = useQuery({
    queryKey: ['reports', 'category-expenses', selectedMonth, selectedYear],
    queryFn: () => reportsService.getCategoryExpenses(selectedMonth, selectedYear),
    enabled: Boolean(selectedMonth && selectedYear),
  });

  const chartData = monthlyReports?.map(report => ({
    name: `Tháng ${report.month}/${report.year}`,
    'Thu nhập': report.income,
    'Chi tiêu': report.expense,
    'Thực nhận': report.net
  })).reverse() || []; // Reverse if we want chronological order depending on API

  if (isLoading || (activePeriod && isCategoryLoading)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  // Calculate totals for the selected month
  const totalIncome = selectedReport?.income || 0;
  const totalExpense = selectedReport?.expense || 0;
  const totalNet = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Báo cáo tài chính</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Phân tích dòng tiền và xu hướng chi tiêu</p>
        </div>
        {availableReports.length > 0 && (
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
            Tháng báo cáo
            <select
              value={activePeriod || ''}
              onChange={(event) => setSelectedPeriod(event.target.value)}
              className="min-w-44 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              aria-label="Chọn tháng báo cáo"
            >
              {availableReports.map(report => (
                <option key={`${report.year}-${report.month}`} value={`${report.year}-${report.month}`}>
                  Tháng {report.month}/{report.year}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 font-medium text-sm">Thu nhập tháng {selectedMonth}/{selectedYear}</p>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mt-3 text-slate-900 tracking-tight">
            {new Intl.NumberFormat('vi-VN').format(totalIncome)} <span className="text-slate-400 text-xl">₫</span>
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 font-medium text-sm">Chi tiêu tháng {selectedMonth}/{selectedYear}</p>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mt-3 text-slate-900 tracking-tight">
            {new Intl.NumberFormat('vi-VN').format(totalExpense)} <span className="text-slate-400 text-xl">₫</span>
          </h2>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-3xl p-7 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <p className="text-slate-300 font-medium text-sm">Tiết kiệm tháng {selectedMonth}/{selectedYear}</p>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-yellow-500 shadow-inner backdrop-blur-sm">
              <LayoutDashboard className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mt-3 text-white tracking-tight relative z-10">
            {new Intl.NumberFormat('vi-VN').format(totalNet)} <span className="text-yellow-500 text-xl">₫</span>
          </h2>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Biểu đồ Thu / Chi theo tháng</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 13, fill: '#64748B', fontWeight: 600 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 13, fill: '#64748B', fontWeight: 600 }}
                tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)}
              />
              <Tooltip
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                itemStyle={{ fontWeight: 700, fontSize: '14px' }}
                labelStyle={{ color: '#64748B', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}
                formatter={(value: number) => [`${new Intl.NumberFormat('vi-VN').format(value)} ₫`, undefined]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600, fontSize: '14px', color: '#475569' }} />
              <Bar dataKey="Thu nhập" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={50} />
              <Bar dataKey="Chi tiêu" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two columns for Data Table and Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Chi tiết từng tháng</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4 text-right">Thu nhập</th>
                  <th className="px-6 py-4 text-right">Chi tiêu</th>
                  <th className="px-6 py-4 text-right">Thực nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyReports?.map((report, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      Tháng {report.month}/{report.year}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      {formatCurrency(report.income)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-500">
                      {formatCurrency(report.expense)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      <span className={`px-3 py-1 rounded-lg text-xs ${report.net >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {report.net >= 0 ? '+' : ''}{formatCurrency(report.net)}
                      </span>
                    </td>
                  </tr>
                ))}
                {!monthlyReports?.length && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium">
                      Chưa có dữ liệu báo cáo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Expenses Breakdown */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm h-full flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Chi tiêu theo danh mục tháng {selectedMonth}/{selectedYear}</h3>
          
          {categoryExpenses && categoryExpenses.length > 0 ? (
            <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {categoryExpenses.map((cat, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110"
                        style={{ backgroundColor: cat.categoryColor || '#94a3b8' }}
                      >
                        <i className={`fa-solid ${cat.categoryIcon || 'fa-tags'} text-sm`}></i>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{cat.categoryName}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{cat.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(cat.amount)}</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.categoryColor || '#94a3b8'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <i className="fa-solid fa-receipt text-2xl text-slate-400"></i>
              </div>
              <p className="font-medium">Chưa có dữ liệu chi tiêu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
