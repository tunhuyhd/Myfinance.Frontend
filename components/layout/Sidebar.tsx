'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  Tags, 
  PieChart, 
  Target, 
  LineChart,
  Users
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const navigation = [
  { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { name: 'Tài khoản', href: '/accounts', icon: Wallet },
  { name: 'Giao dịch', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Danh mục', href: '/categories', icon: Tags },
  { name: 'Ngân sách', href: '/budgets', icon: PieChart },
  { name: 'Tiết kiệm', href: '/savings', icon: Target },
  { name: 'Báo cáo', href: '/reports', icon: LineChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin === true;

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 shadow-xl h-full hidden md:flex z-10">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
          <Wallet className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          MyFinance
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-blue-900/50 text-white font-medium border border-blue-800/30 shadow-inner' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-yellow-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
        
        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Quản trị
            </div>
            <Link
              href="/admin/users"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                pathname === '/admin/users' 
                  ? 'bg-blue-900/50 text-white font-medium border border-blue-800/30 shadow-inner' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Users className={`w-5 h-5 transition-colors ${pathname === '/admin/users' ? 'text-yellow-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span>Người dùng</span>
            </Link>
          </>
        )}
      </nav>
      
      <div className="p-4 border-t border-slate-800/50">
        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-sm">
          <p className="text-sm font-medium text-slate-200">Nâng cấp Pro</p>
          <p className="text-xs text-slate-400 mt-1 mb-3">Mở khóa tính năng báo cáo chuyên sâu</p>
          <button className="w-full text-xs bg-gradient-to-r from-yellow-600 to-yellow-500 text-white py-2 rounded-lg font-medium shadow-sm hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300">
            Khám phá ngay
          </button>
        </div>
      </div>
    </div>
  );
}
