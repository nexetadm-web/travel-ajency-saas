'use client';

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
  LogOut,
  ChevronRight,
  Lock,
  Search,
  FileText,
  X,
} from 'lucide-react';

export default function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { agency, isLoading } = useAgency();

  const isSuper =
    agency?.role === 'super_admin' ||
    agency?.email === 'mnuhbhatti333@gmail.com' ||
    agency?.email === 'mnuhbhattii333@gmail.com';

  // Owner check for Secret Profit dashboard
  const isOwner = (agency?.role as string) === 'agency' || (agency?.role as string) === 'owner' || isSuper;

  const navItems = [
    { urdu: 'ڈیش بورڈ', eng: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { urdu: 'عمرہ و حج گروپس', eng: 'Groups', href: '/dashboard/groups', icon: Users },
    { urdu: 'حاجی و زائرین', eng: 'Hujjaj', href: '/dashboard/pilgrims', icon: UserCheck },
    { urdu: 'ٹکٹنگ اور PNR', eng: 'Tickets', href: '/dashboard/tickets', icon: Plane },
    { urdu: '✈️ PNR لائیو چیک', eng: 'PNR Check', href: '/dashboard/flights/pnr-check', icon: Search },
    { urdu: 'عمرہ ویزہ ٹریکنگ', eng: 'Visas', href: '/dashboard/visas', icon: FileCheck2 },
    { urdu: '🌍 ویزہ کنسلٹنسی', eng: 'Consultancy', href: '/dashboard/visa-consultancy', icon: Globe2 },
    { urdu: '✈️ ٹور پیکجز', eng: 'Tours', href: '/dashboard/tours', icon: Compass },
    { urdu: 'ہوٹل و ٹرانسپورٹ', eng: 'Hotels', href: '/dashboard/hotels', icon: Building2 },
    { urdu: 'مکمل کھاتہ', eng: 'Ledger', href: '/dashboard/ledger', icon: BookOpen },
    { urdu: '💰 کیش بک', eng: 'Cash Book', href: '/dashboard/cashbook', icon: Wallet },
    { urdu: '👥 سب ایجنٹس', eng: 'Sub-Agents', href: '/dashboard/sub-agents', icon: UserPlus },
    { urdu: '🧳 کٹ انوینٹری', eng: 'Inventory', href: '/dashboard/inventory', icon: Luggage },
    { urdu: 'دفتر کے اخراجات', eng: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
    { urdu: '📊 اسمارٹ رپورٹس', eng: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { urdu: 'ایجنسی سیٹنگز', eng: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-full md:w-72 lg:w-[240px] xl:w-[260px] max-w-[320px] bg-[#0f172a] bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-2xl border-r border-slate-800/80 p-4 sm:p-5 lg:p-3 xl:p-4 flex flex-col justify-between h-full select-none overflow-y-auto" style={{ transform: 'none' }}>
      <div>
        {/* Dynamic Agency Branding Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-5 lg:pb-3 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1 rounded-xl shadow-lg shadow-emerald-500/25 flex-shrink-0">
              {agency?.logo_url ? (
                <img
                  src={agency.logo_url}
                  alt={agency?.name || 'Agency Logo'}
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 rounded-lg object-cover"
                />
              ) : (
                <img
                  src="/logo.png"
                  alt="Al-Haram Travel Logo"
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 rounded-lg object-cover shadow-sm"
                />
              )}
            </div>
            <div className="overflow-hidden min-w-0">
              <h2 className="font-extrabold text-xs sm:text-sm text-white truncate tracking-tight">
                {agency?.name || (isLoading ? 'لوڈ ہو رہا ہے...' : 'Al-Haram Travel')}
              </h2>
              <span className="block text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                لائسنس: {agency?.license_no || 'DTS Reg. Verified'}
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white transition shrink-0"
              aria-label="بند کریں"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Super Admin Portal Button */}
        {isSuper && (
          <div className="pt-2.5">
            <Link
              href="/super-admin"
              onClick={onCloseMobile}
              className="w-full px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-lg shadow-purple-600/40 transition flex items-center justify-between group border border-purple-400/20"
              style={{ transform: 'none' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🛡️</span>
                <span>سپر ایڈمن پورٹل</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        )}

        {/* FEATURE 7: Owner Secret Profit Dashboard link (Sirf Malik Ke Liye) */}
        {isOwner && (
          <div className="pt-2">
            <Link
              href="/dashboard/owner/profit"
              onClick={onCloseMobile}
              className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                pathname === '/dashboard/owner/profit'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md'
                  : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300'
              }`}
              style={{ transform: 'none' }}
            >
              <div className="flex items-center justify-between w-full" dir="rtl" style={{ transform: 'none' }}>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="font-urdu text-[12px] lg:text-[11px] text-emerald-300">خفیہ منافع</span>
                </div>
                <span className="font-sans text-[9px] text-emerald-400/80 font-mono" dir="ltr">(Secret Profit)</span>
              </div>
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="mt-3 lg:mt-2.5 space-y-0.5 lg:space-y-0.5 transform-none" style={{ transform: 'none' }}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 lg:py-2 xl:py-2.5 rounded-xl transition-all transform-none ${
                  active
                    ? 'bg-white/10 backdrop-blur-xl border-l-4 border-emerald-400 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                style={{ transform: 'none' }}
              >
                <div className="flex items-center gap-2.5 lg:gap-2 transform-none" style={{ transform: 'none' }}>
                  <Icon
                    className={`w-4 h-4 lg:w-[18px] lg:h-[18px] flex-shrink-0 ${
                      active ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="font-english text-[10px] lg:text-[9px] xl:text-[10px] text-gray-400 tracking-wider transform-none uppercase" style={{ transform: 'none' }}>
                    ({item.eng})
                  </span>
                </div>
                <span
                  className="font-urdu text-[14px] md:text-[15px] lg:text-[13px] xl:text-[14px] leading-[1.5] text-white transform-none rotate-0 not-italic"
                  dir="rtl"
                  style={{ transform: 'none', fontStyle: 'normal' }}
                >
                  {item.urdu}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Card (Glass bg-white/5) */}
      <div className="pt-4 border-t border-white/10 mt-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 backdrop-blur border border-white/10 text-xs">
          <div className="truncate pr-2">
            <span className="block font-bold text-white truncate">
              {agency?.owner_name || 'مالک ایجنسی'}
            </span>
            <span className="block text-[10px] text-slate-400 truncate">
              {agency?.phone || 'آن لائن سیشن'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="لاگ آؤٹ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
