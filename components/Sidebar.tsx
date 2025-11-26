"use client";
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, BarChart3, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Companies', href: '/pipelines/COMPANIES', icon: Zap },
    { label: 'Influencers', href: '/pipelines/INFLUENCERS', icon: BarChart3 },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/40 border-r border-slate-700/50 h-screen flex flex-col backdrop-blur-xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700/30">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Prospout
        </h1>
        <p className="text-xs text-slate-400 mt-1">Commercial Ops</p>
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

      {/* Bottom Actions */}
      <div className="px-4 py-4 space-y-2 border-t border-slate-700/30">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button 
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </button>
      </div>
    </aside>
  );
}
