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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan tài chính</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Theo dõi thu chi và số dư của bạn</p>
        </div>
        <button className="bg-slate-900 text-yellow-500 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all hover:scale-105 active:scale-95 hidden sm:block border border-slate-700">
          + Thêm giao dịch
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-3xl p-7 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
            <Wallet className="w-32 h-32 text-yellow-500" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative z-10">
            <p className="text-slate-300 font-medium text-sm">Tổng số dư</p>
            <h2 className="text-4xl font-bold mt-2 text-white tracking-tight">24.500.000 <span className="text-yellow-500 text-2xl">₫</span></h2>
            <div className="mt-6 inline-flex items-center space-x-1 text-xs font-bold text-slate-900 bg-yellow-500 px-3 py-1.5 rounded-full shadow-sm">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12.5% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 font-medium text-sm">Tổng thu nhập (Tháng này)</p>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mt-3 text-slate-900 tracking-tight">25.000.000 <span className="text-slate-400 text-xl">₫</span></h2>
          <div className="mt-5 flex items-center text-sm font-medium text-slate-500">
            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-md mr-2 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1" />5.2%</span>
            so với tháng trước
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 font-medium text-sm">Tổng chi tiêu (Tháng này)</p>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mt-3 text-slate-900 tracking-tight">8.450.000 <span className="text-slate-400 text-xl">₫</span></h2>
          <div className="mt-5 flex items-center text-sm font-medium text-slate-500">
            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md mr-2 flex items-center"><ArrowDownRight className="w-3 h-3 mr-1" />2.1%</span>
            so với tháng trước
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Biểu đồ Thu / Chi</h3>
            <select className="text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-medium text-slate-600 px-4 py-2 outline-none cursor-pointer transition-all hover:bg-slate-100">
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
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748B', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748B', fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 600, fontSize: '14px' }}
                  labelStyle={{ color: '#64748B', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="income" name="Thu" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="Chi" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Giao dịch gần đây</h3>
            <button className="text-sm font-bold text-yellow-600 hover:text-yellow-700 hover:underline underline-offset-4 transition-all">Xem tất cả</button>
          </div>
          
          <div className="flex-1 space-y-2">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${t.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                    {t.amount > 0 ? <ArrowDownRight className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm group-hover:text-blue-900 transition-colors">{t.title}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{t.category} • {t.date}</p>
                  </div>
                </div>
                <div className={`font-bold text-sm ${t.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                  {t.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(t.amount)} <span className="text-xs font-medium text-slate-400">₫</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
