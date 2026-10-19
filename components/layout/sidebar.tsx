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
    <aside className="w-full md:w-72 max-w-[320px] bg-[#0f172a] bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-2xl border-r border-slate-800/80 p-4 sm:p-5 flex flex-col justify-between h-full select-none overflow-y-auto" style={{ transform: 'none' }}>
      <div>
        {/* Dynamic Agency Branding Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-white/10 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1 rounded-xl shadow-lg shadow-emerald-500/25 flex-shrink-0">
              {agency?.logo_url ? (
                <img
                  src={agency.logo_url}
                  alt={agency?.name || 'Agency Logo'}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover"
                />
              ) : (
                <img
                  src="/logo.png"
                  alt="Al-Haram Travel Logo"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover shadow-sm"
                />
              )}
            </div>
            <div className="overflow-hidden min-w-0">
              <h2 className="font-extrabold text-sm text-white truncate tracking-tight">
                {agency?.name || (isLoading ? 'لوڈ ہو رہا ہے...' : 'Al-Haram Travel')}
              </h2>
              <span className="block text-[11px] text-slate-400 font-medium truncate">
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
          <div className="pt-3">
            <Link
              href="/super-admin"
              onClick={onCloseMobile}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/40 transition flex items-center justify-between group border border-purple-400/20"
              style={{ transform: 'none' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <span>سپر ایڈمن پورٹل</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        )}

        {/* FEATURE 7: Owner Secret Profit Dashboard link (Sirf Malik Ke Liye) */}
        {isOwner && (
          <div className="pt-2">
            <Link
              href="/dashboard/owner/profit"
              onClick={onCloseMobile}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                pathname === '/dashboard/owner/profit'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md'
                  : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300'
              }`}
              style={{ transform: 'none' }}
            >
              <div className="flex items-center justify-between w-full" dir="rtl" style={{ transform: 'none' }}>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-urdu text-[13px] text-emerald-300">خفیہ منافع</span>
                </div>
                <span className="font-sans text-[10px] text-emerald-400/80 font-mono" dir="ltr">(Secret Profit)</span>
              </div>
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="mt-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-normal transition duration-150 ${
                  active
                    ? 'bg-white/10 backdrop-blur-xl border-l-4 border-emerald-400 text-white shadow-lg font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                style={{ transform: 'none' }}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    active ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <div className="flex items-center gap-2 min-w-0 flex-1 justify-between" dir="rtl" style={{ transform: 'none' }}>
                  <span className="font-urdu text-[14px] font-normal text-white truncate" style={{ transform: 'none' }}>
                    {item.urdu}
                  </span>
                  <span className="font-sans text-[11px] uppercase tracking-wider text-slate-400 opacity-70 shrink-0" dir="ltr" style={{ transform: 'none' }}>
                    ({item.eng})
                  </span>
                </div>
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
