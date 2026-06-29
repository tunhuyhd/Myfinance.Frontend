'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { Loader2, User, Shield, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-slate-500 mt-1 font-medium">Quản lý thông tin tài khoản của bạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20 mb-4 transform hover:scale-105 transition-transform duration-300">
              <span className="text-4xl font-bold tracking-tight">{user?.fullName?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">{user?.email}</p>
            
            <div className="w-full mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500 flex items-center"><Shield className="w-4 h-4 mr-1 text-slate-400" /> Vai trò</span>
              <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">Người dùng</span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-yellow-600" />
              Thông tin cơ bản
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và tên</label>
                <input 
                  type="text" 
                  defaultValue={user?.fullName} 
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên đăng nhập</label>
                <input 
                  type="text" 
                  defaultValue={user?.username} 
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                <input 
                  type="email" 
                  defaultValue={user?.email} 
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start space-x-3">
                <div className="bg-white text-slate-600 p-2 rounded-xl shadow-sm border border-slate-100">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Bảo mật tài khoản</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1 mb-3 leading-relaxed">Tính năng thay đổi mật khẩu và cập nhật thông tin sẽ được hỗ trợ trong các phiên bản tiếp theo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
