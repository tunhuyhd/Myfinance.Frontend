'use client';

import { ArrowDownRight, ArrowUpRight, CreditCard, DollarSign, Wallet } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'T2', income: 4000, expense: 2400 },
  { name: 'T3', income: 3000, expense: 1398 },
  { name: 'T4', income: 2000, expense: 9800 },
  { name: 'T5', income: 2780, expense: 3908 },
  { name: 'T6', income: 1890, expense: 4800 },
  { name: 'T7', income: 2390, expense: 3800 },
  { name: 'CN', income: 3490, expense: 4300 },
];

const recentTransactions = [
  { id: 1, title: 'Ăn trưa', amount: -150000, date: 'Hôm nay', category: 'Ăn uống' },
  { id: 2, title: 'Lương tháng 6', amount: 25000000, date: 'Hôm qua', category: 'Thu nhập' },
  { id: 3, title: 'Mua sắm Shopee', amount: -450000, date: '26/06', category: 'Mua sắm' },
  { id: 4, title: 'Đổ xăng', amount: -70000, date: '25/06', category: 'Di chuyển' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan tài chính</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi thu chi và số dư của bạn</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors hidden sm:block">
          + Thêm giao dịch
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Wallet className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-primary-100 font-medium text-sm">Tổng số dư</p>
            <h2 className="text-3xl font-bold mt-2">24.500.000 ₫</h2>
            <div className="mt-4 inline-flex items-center space-x-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              <ArrowUpRight className="w-3 h-3" />
              <span>+12.5% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 font-medium text-sm">Tổng thu nhập (Tháng này)</p>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-2 text-gray-900">25.000.000 ₫</h2>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <span className="text-green-500 font-medium mr-1">+5.2%</span>
            so với tháng trước
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 font-medium text-sm">Tổng chi tiêu (Tháng này)</p>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-2 text-gray-900">8.450.000 ₫</h2>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <span className="text-red-500 font-medium mr-1">-2.1%</span>
            so với tháng trước
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Biểu đồ Thu / Chi</h3>
            <select className="text-sm bg-gray-50 border-none rounded-lg focus:ring-primary-500 font-medium text-gray-600 px-3 py-1.5 outline-none">
              <option>Tuần này</option>
              <option>Tháng này</option>
              <option>Năm nay</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="income" name="Thu" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="Chi" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700">Xem tất cả</button>
          </div>
          
          <div className="flex-1 space-y-5">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {t.amount > 0 ? <ArrowDownRight className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.category} • {t.date}</p>
                  </div>
                </div>
                <div className={`font-semibold text-sm ${t.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {t.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(t.amount)} ₫
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
