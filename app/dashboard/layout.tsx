'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAgency } from '@/hooks/useAgency';
import {
  LayoutDashboard,
  Users,
  Plane,
  FileCheck2,
  Building2,
  BookOpen,
  Receipt,
  BarChart3,
  Settings,
  ShieldCheck,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { agency, isLoading } = useAgency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isSuper = agency?.role === 'super_admin' || agency?.email === 'mnuhbhatti333@gmail.com' || agency?.email === 'mnuhbhattii333@gmail.com';

  const navItems = [
    { name: 'ڈیش بورڈ (Dashboard)', href: '/dashboard', icon: LayoutDashboard },
    { name: 'عمرہ و حج گروپس (Groups)', href: '/dashboard/groups', icon: Users },
    { name: 'ٹکٹنگ اور PNR (Tickets)', href: '/dashboard/tickets', icon: Plane },
    { name: 'ویزہ کنبان ٹریکنگ (Visas)', href: '/dashboard/visas', icon: FileCheck2 },
    { name: 'ہوٹل و ٹرانسپورٹ (Hotels)', href: '/dashboard/hotels', icon: Building2 },
    { name: 'مکمل کھاتہ / حساب کتاب (Ledger)', href: '/dashboard/ledger', icon: BookOpen },
    { name: 'دفتر کے اخراجات (Expenses)', href: '/dashboard/expenses', icon: Receipt },
    { name: 'رپورٹس اور تجزیات (Reports)', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'ایجنسی سیٹنگز (Settings)', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-950/80 border-r border-slate-800/80 backdrop-blur-xl p-5 justify-between sticky top-0 h-screen select-none z-30">
        <div>
          {/* 100% Dynamic Agency Branding Header */}
          <div className="flex items-center gap-3.5 pb-6 border-b border-slate-800/80">
            {agency?.logo_url ? (
              <img
                src={agency.logo_url}
                alt={agency?.name || 'Agency Logo'}
                className="w-12 h-12 rounded-2xl object-cover border border-emerald-500/30 shadow-md shadow-emerald-500/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 uppercase">
                {agency?.name ? agency.name.charAt(0) : 'T'}
              </div>
            )}
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-sm text-white truncate tracking-tight">
                {agency?.name || (isLoading ? 'لوڈ ہو رہا ہے...' : 'میری ٹریول ایجنسی')}
              </h2>
              <span className="block text-[11px] text-emerald-400 font-medium truncate">
                لائسنس: {agency?.license_no || 'DTS Reg.'}
              </span>
            </div>
          </div>

          {/* CRITICAL SUPER ADMIN PURPLE BUTTON IN SIDEBAR */}
          {isSuper && (
            <div className="pt-4">
              <Link
                href="/super-admin"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🛡️</span>
                  <span>سپر ایڈمن پورٹل</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User & Logout Card */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 border border-slate-800/90 text-xs">
            <div className="truncate pr-2">
              <span className="block font-semibold text-slate-200 truncate">{agency?.owner_name || 'مالک ایجنسی'}</span>
              <span className="block text-[10px] text-slate-400 truncate">{agency?.phone || 'آن لائن'}</span>
            </div>
            <button
              onClick={handleLogout}
              title="لاگ آؤٹ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE NAVBAR */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm">
            {agency?.name ? agency.name.charAt(0) : 'T'}
          </div>
          <span className="font-bold text-sm text-white truncate max-w-[180px]">
            {agency?.name || 'Travel SaaS'}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-900 text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2 z-40">
          {isSuper && (
            <Link
              href="/super-admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-2 mb-2"
            >
              <span>🛡️</span> سپر ایڈمن پورٹل
            </Link>
          )}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-900"
            >
              <item.icon className="w-4 h-4 text-emerald-400" />
              <span>{item.name}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full mt-2 text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            لاگ آؤٹ
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-y-auto">
        {/* Top Header bar with Quick Details */}
        <header className="px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur flex items-center justify-between text-xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">
              لائیو ایجنسی سیشن: <strong className="text-white">{agency?.name || 'Travel Agency'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/settings/whatsapp"
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              WhatsApp Cloud API فعال ہے
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-slate-400 hover:text-white transition"
              title="سیٹنگز"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Content Children */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
