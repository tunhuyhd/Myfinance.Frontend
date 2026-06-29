'use client';

import { useAuthStore } from '@/store/auth.store';
import { Bell, Search, LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-20">
      <div className="flex-1 max-w-md">
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
  );
}
