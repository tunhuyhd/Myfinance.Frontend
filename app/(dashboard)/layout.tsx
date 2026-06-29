'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, hasHydrated, router]);

  // Prevent hydration mismatch and hide content until auth is verified
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
