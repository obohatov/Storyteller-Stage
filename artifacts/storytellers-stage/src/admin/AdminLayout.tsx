import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useGetCurrentAuthUser, beginBrowserLogin } from '@workspace/api-client-react';
import { Loader2, LayoutDashboard, BookOpen, Drama, UserRound, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@workspace/replit-auth-web'; // Or from api-client if it's there. The prompt said: "Check auth via useAuth() from @workspace/replit-auth-web — if not authenticated show a minimal login page with a 'Sign in with Replit' button that calls login()"

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, login, logout } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-stage-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stage-mint" />
      </div>
    );
  }

  if (!isLoading && !user) {
    return (
      <div className="min-h-[100dvh] bg-stage-cream flex flex-col items-center justify-center p-6">
        <div className="bg-white p-12 rounded-2xl shadow-xl shadow-stage-yellow/10 max-w-md w-full text-center border border-stage-yellow/20">
          <h1 className="text-3xl font-serif font-bold text-stage-dark mb-4">The Writer's Desk</h1>
          <p className="text-stage-dark/70 font-sans mb-8">Sign in to manage your stories, plays, and translations.</p>
          <button
            onClick={() => login()}
            className="w-full py-3 px-6 bg-stage-dark text-white rounded-lg font-sans font-medium hover:bg-black transition-colors"
          >
            Sign in with Replit
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/fairy-tales', label: 'Fairy Tales', icon: BookOpen },
    { href: '/admin/plays', label: 'Plays', icon: Drama },
    { href: '/admin/about', label: 'About Page', icon: UserRound },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F7F5F0] flex font-sans text-stage-dark">
      <aside className="w-64 bg-[#EBE7DF] border-r border-[#DCD6CC] flex flex-col shrink-0 sticky top-0 h-[100dvh]">
        <div className="p-8">
          <h1 className="font-serif text-2xl font-bold text-stage-dark leading-tight">
            The Writer's<br />Desk
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/admin' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors",
                    isActive 
                      ? "bg-white shadow-sm border border-[#DCD6CC] text-stage-mint font-medium" 
                      : "text-stage-dark/70 hover:bg-[#DCD6CC]/50 hover:text-stage-dark"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-stage-mint" : "text-stage-dark/50")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#DCD6CC]">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-stage-dark/70 hover:bg-[#DCD6CC]/50 hover:text-stage-dark transition-colors"
          >
            <LogOut className="w-5 h-5 text-stage-dark/50" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
