"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, BarChart3, Settings, LogOut, UserCircle2, Brain, Camera, Building, User } from 'lucide-react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

const supabase = getBrowserSupabaseClient();

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      if (!active) return;
      const user = data.user;
      setUserEmail(user?.email ?? null);
      const meta: any = user?.user_metadata || {};
      setUserName(meta.full_name || meta.name || null);
      setAvatarUrl(meta.avatar_url || meta.picture || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      const user = session?.user;
      setUserEmail(user?.email ?? null);
      const meta: any = user?.user_metadata || {};
      setUserName(meta.full_name || meta.name || null);
      setAvatarUrl(meta.avatar_url || meta.picture || null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const menuItems = [
    { label: t('Dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('Companies'), href: '/pipelines/COMPANIES', icon: Building },
    { label: t('Influencers'), href: '/pipelines/INFLUENCERS', icon: User },
    { label: 'AI Analytics', href: '/analysis', icon: Brain },
    { label: 'Content Planner', href: '/content', icon: Camera },
  ];

  const isActive = (href: string) => pathname === href;

  const userInitial = userEmail ? userEmail[0]?.toUpperCase() : '?';

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-gradient-to-r from-slate-900/70 via-slate-800/70 to-slate-900/70 backdrop-blur-xl border-b border-slate-700/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{t('Prospout')}</span>
          <span className="text-xs text-slate-400">{t('Commercial Ops')}</span>
        </div>
        <button onClick={()=>setOpen(true)} className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 flex items-center gap-2">
          <span className="sr-only">Open Menu</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h16" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/40 border-r border-slate-700/50 h-screen flex-col backdrop-blur-xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700/30">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {t('Prospout')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">{t('Commercial Ops')}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-gradient-to-r from-cyan-600/30 to-purple-600/30 border border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Profile & Actions */}
        <div className="px-4 py-4 space-y-3 border-t border-slate-700/30">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900/40 border border-slate-700/40 text-sm text-slate-200">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-semibold text-white">
                {userEmail ? userInitial : <UserCircle2 className="w-6 h-6" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{t('Signed in')}</p>
              <p className="text-sm font-medium truncate">{userName ?? userEmail ?? t('Fetching user…')}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition"
            >
              {t('Logout')}
            </button>
          </div>

          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">{t('Settings')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-900/70 border-r border-slate-700/50 flex flex-col">
            <div className="p-4 border-b border-slate-700/30 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{t('Prospout')}</div>
                <div className="text-xs text-slate-400">{t('Commercial Ops')}</div>
              </div>
              <button onClick={()=>setOpen(false)} className="px-2 py-1 bg-slate-800/60 border border-slate-700/50 rounded text-slate-200">Close</button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => { setOpen(false); router.push(item.href); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition ${active ? 'bg-slate-800/60 text-cyan-300' : 'text-slate-300 hover:bg-slate-800/40'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="px-3 py-3 border-t border-slate-700/30">
              <button onClick={() => { setOpen(false); router.push('/settings'); }} className="w-full px-3 py-2 rounded bg-slate-800/50 text-slate-200 flex items-center gap-2"><Settings className="w-4 h-4"/> {t('Settings')}</button>
              <button onClick={() => { setOpen(false); handleLogout(); }} className="w-full px-3 py-2 mt-2 rounded bg-slate-800/50 text-orange-400 font-semibold">{t('Logout')}</button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
