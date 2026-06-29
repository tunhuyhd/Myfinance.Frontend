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

const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const response = await api.post('/Auth/login', data);
      const { token, refreshToken, username, userId } = response.data;
      
      setAuth(
        { id: userId, username, email: '', fullName: username },
        token,
        refreshToken
      );
      
      toast.success('Đăng nhập thành công!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
      
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Đăng nhập</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tên đăng nhập
          </label>
          <input
            {...register('username')}
            type="text"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'
            } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all bg-white/50 backdrop-blur-sm`}
            placeholder="Nhập tên đăng nhập"
          />
          {errors.username && (
            <p className="mt-1.5 text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mật khẩu
          </label>
          <input
            {...register('password')}
            type="password"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'
            } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all bg-white/50 backdrop-blur-sm`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Chưa có tài khoản?{' '}
        <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500 hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
