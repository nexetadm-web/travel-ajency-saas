'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAgency } from '@/hooks/useAgency';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Plane,
  FileCheck2,
  Globe2,
  Compass,
  Building2,
  BookOpen,
  Wallet,
  UserPlus,
  Luggage,
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

  const isSuper =
    agency?.role === 'super_admin' ||
    agency?.email === 'mnuhbhatti333@gmail.com' ||
    agency?.email === 'mnuhbhattii333@gmail.com';

  const navItems = [
    { name: 'ڈیش بورڈ (Dashboard)', href: '/dashboard', icon: LayoutDashboard },
    { name: 'عمرہ و حج گروپس (Groups)', href: '/dashboard/groups', icon: Users },
    { name: 'حاجی و مسافر (Pilgrims)', href: '/dashboard/pilgrims', icon: UserCheck },
    { name: 'ٹکٹنگ اور PNR (Tickets)', href: '/dashboard/tickets', icon: Plane },
    { name: 'عمرہ ویزہ ٹریکنگ (Visas)', href: '/dashboard/visas', icon: FileCheck2 },
    { name: '🌍 ویزہ کنسلٹنسی (Consultancy)', href: '/dashboard/visa-consultancy', icon: Globe2 },
    { name: '✈️ ٹور پیکجز (Tours)', href: '/dashboard/tours', icon: Compass },
    { name: 'ہوٹل و ٹرانسپورٹ (Hotels)', href: '/dashboard/hotels', icon: Building2 },
    { name: 'مکمل کھاتہ (Ledger)', href: '/dashboard/ledger', icon: BookOpen },
    { name: '💰 کیش بک (Cash Book)', href: '/dashboard/cashbook', icon: Wallet },
    { name: '👥 سب ایجنٹس (Sub-Agents)', href: '/dashboard/sub-agents', icon: UserPlus },
    { name: '🧳 کٹ انوینٹری (Inventory)', href: '/dashboard/inventory', icon: Luggage },
    { name: 'دفتر کے اخراجات (Expenses)', href: '/dashboard/expenses', icon: Receipt },
    { name: '📊 اسمارٹ رپورٹس (Reports)', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'ایجنسی سیٹنگز (Settings)', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-slate-800 flex flex-col md:flex-row antialiased">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-2xl border-r border-slate-800/80 p-5 justify-between sticky top-0 h-screen select-none z-30 overflow-y-auto">
        <div>
          {/* Dynamic Agency Branding Header */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-white/10">
            {agency?.logo_url ? (
              <img
                src={agency.logo_url}
                alt={agency?.name || 'Agency Logo'}
                className="w-12 h-12 rounded-2xl object-cover border border-emerald-400/30 shadow-lg shadow-emerald-500/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 uppercase">
                {agency?.name ? agency.name.charAt(0) : 'T'}
              </div>
            )}
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-sm text-white truncate tracking-tight">
                {agency?.name || (isLoading ? 'لوڈ ہو رہا ہے...' : 'میری ٹریول ایجنسی')}
              </h2>
              <span className="block text-[11px] text-slate-300 font-medium truncate">
                لائسنس: {agency?.license_no || 'DTS Reg.'}
              </span>
            </div>
          </div>

          {/* CRITICAL SUPER ADMIN PURPLE BUTTON IN SIDEBAR */}
          {isSuper && (
            <div className="pt-4">
              <Link
                href="/super-admin"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/40 transition flex items-center justify-between group border border-purple-400/20"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🛡️</span>
                  <span>سپر ایڈمن پورٹل</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          )}

          {/* Navigation Links with Active Styling */}
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition ${
                    active
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 ring-1 ring-white/20'
                      : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      active ? 'text-white' : 'text-white/70 group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User & Logout Card */}
        <div className="pt-4 border-t border-white/10 mt-4">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <div className="truncate pr-2">
              <span className="block font-bold text-white truncate">
                {agency?.owner_name || 'مالک ایجنسی'}
              </span>
              <span className="block text-[10px] text-slate-300 truncate">
                {agency?.phone || 'آن لائن'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="لاگ آؤٹ"
              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-white/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE NAVBAR */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {agency?.name ? agency.name.charAt(0) : 'T'}
          </div>
          <span className="font-bold text-sm text-gray-900 truncate max-w-[180px]">
            {agency?.name || 'Travel SaaS'}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a] border-b border-slate-800 p-4 space-y-1.5 z-40 shadow-2xl max-h-[80vh] overflow-y-auto text-white">
          {isSuper && (
            <Link
              href="/super-admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-2 mb-2 shadow"
            >
              <span>🛡️</span> سپر ایڈمن پورٹل
            </Link>
          )}
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4 text-emerald-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full mt-2 text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-white/10 flex items-center gap-2 border-t border-slate-800 pt-3"
          >
            <LogOut className="w-4 h-4" />
            لاگ آؤٹ
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFF] overflow-y-auto">
        {/* Top Header bar with Quick Details */}
        <header className="px-6 py-3.5 border-b border-gray-100 bg-white/80 backdrop-blur flex items-center justify-between text-xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-500">
              لائیو ایجنسی سیشن: <strong className="text-gray-900">{agency?.name || 'Travel Agency'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/settings/whatsapp"
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              WhatsApp Cloud API فعال ہے
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-gray-400 hover:text-gray-700 transition p-1.5 rounded-lg hover:bg-gray-100"
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
