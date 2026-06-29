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
  LineChart 
} from 'lucide-react';

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

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm h-full hidden md:flex z-10">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
          <Wallet className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
          MyFinance
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-primary-50 text-primary-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-4 rounded-2xl">
          <p className="text-sm font-medium text-primary-900">Nâng cấp Pro</p>
          <p className="text-xs text-primary-600 mt-1 mb-3">Mở khóa tính năng báo cáo chuyên sâu</p>
          <button className="w-full text-xs bg-primary-600 text-white py-2 rounded-lg font-medium shadow-sm hover:bg-primary-700 transition-colors">
            Khám phá ngay
          </button>
        </div>
      </div>
    </div>
  );
}
