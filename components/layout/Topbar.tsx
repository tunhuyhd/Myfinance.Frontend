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
    <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-20">
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm kiếm giao dịch, danh mục..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 rounded-xl text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 p-1 pr-2 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
          >
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700 leading-tight">{user?.fullName || 'Người dùng'}</p>
              <p className="text-xs text-gray-500">Free Plan</p>
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
