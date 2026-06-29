'use client';

import { useAuthStore } from '@/store/auth.store';
import { Bell, Search, LogOut, User as UserIcon, Menu, X, LayoutDashboard, Wallet, ArrowRightLeft, Tags, PieChart, Target, LineChart } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const navigation = [
  { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { name: 'Tài khoản', href: '/accounts', icon: Wallet },
  { name: 'Giao dịch', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Danh mục', href: '/categories', icon: Tags },
  { name: 'Ngân sách', href: '/budgets', icon: PieChart },
  { name: 'Tiết kiệm', href: '/savings', icon: Target },
  { name: 'Báo cáo', href: '/reports', icon: LineChart },
];

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <>
    <header className="h-20 px-4 md:px-8 flex items-center justify-between bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-20">
      
      <div className="flex items-center md:hidden mr-3">
        <button 
          onClick={() => setShowMobileMenu(true)}
          className="p-2 text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 max-w-md mr-2 sm:mr-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-yellow-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm kiếm giao dịch, danh mục..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 rounded-xl text-sm transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 p-1 pr-2 rounded-full hover:bg-white transition-all border border-transparent hover:border-slate-200 hover:shadow-sm"
          >
            <div className="w-9 h-9 rounded-full bg-slate-900 text-yellow-500 flex items-center justify-center font-bold text-sm shadow-inner">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-slate-900 leading-tight">{user?.fullName || 'Người dùng'}</p>
              <p className="text-xs font-medium text-slate-500">Free Plan</p>
            </div>
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-40 animate-in fade-in slide-in-from-top-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Hồ sơ cá nhân</span>
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    {showMobileMenu && (
      <div className="fixed inset-0 z-50 md:hidden flex">
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setShowMobileMenu(false)} />
        <div className="relative w-4/5 max-w-xs bg-slate-900 h-full flex flex-col animate-in slide-in-from-left duration-300 shadow-2xl">
          <div className="p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">MyFinance</span>
            </div>
            <button onClick={() => setShowMobileMenu(false)} className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-blue-900/50 text-white font-medium border border-blue-800/30 shadow-inner' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-yellow-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors rounded-xl font-medium">
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
