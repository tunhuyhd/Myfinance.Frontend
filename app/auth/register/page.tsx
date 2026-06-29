'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const response = await api.post('/Auth/register', data);
      const { token, refreshToken, username, userId } = response.data;
      
      setAuth(
        { id: userId, username, email: data.email, fullName: data.fullName },
        token,
        refreshToken
      );
      
      toast.success('Đăng ký thành công! Chào mừng đến với MyFinance.');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
      
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6 text-center">Đăng ký tài khoản</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            Họ và tên
          </label>
          <input
            {...register('fullName')}
            type="text"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.fullName ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/20 bg-slate-50'
            } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all focus:bg-white text-slate-900 font-medium`}
            placeholder="Nguyễn Văn A"
          />
          {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.email ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/20 bg-slate-50'
            } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all focus:bg-white text-slate-900 font-medium`}
            placeholder="email@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            Tên đăng nhập
          </label>
          <input
            {...register('username')}
            type="text"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.username ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/20 bg-slate-50'
            } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all focus:bg-white text-slate-900 font-medium`}
            placeholder="username"
          />
          {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            Mật khẩu
          </label>
          <input
            {...register('password')}
            type="password"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.password ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/20 bg-slate-50'
            } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all focus:bg-white text-slate-900 font-medium`}
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-slate-900/10 text-sm font-bold text-yellow-500 bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 mt-4"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tạo tài khoản'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm font-medium text-slate-500">
        Đã có tài khoản?{' '}
        <Link href="/auth/login" className="font-bold text-slate-900 hover:text-yellow-600 hover:underline transition-colors">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
