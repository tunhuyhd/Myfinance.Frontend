export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-slate-200/50 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-300/30 blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white mb-4 shadow-lg shadow-yellow-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2"/>
              <line x1="2" x2="22" y1="10" y2="10"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">MyFinance</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Quản lý tài chính cá nhân thông minh</p>
        </div>
        
        {children}
      </div>
    </div>
  );
}
