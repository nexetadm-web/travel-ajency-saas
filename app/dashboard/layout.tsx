'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAgency } from '@/hooks/useAgency';
import Sidebar from '@/components/layout/sidebar';
import { Menu, X, Settings } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { agency } = useAgency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-slate-800 flex flex-col md:flex-row antialiased">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block sticky top-0 h-screen flex-shrink-0 z-30">
        <Sidebar />
      </div>

      {/* MOBILE NAVBAR */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {agency?.name ? agency.name.charAt(0) : 'H'}
          </div>
          <span className="font-bold text-sm text-gray-900 truncate max-w-[180px]">
            {agency?.name || 'Al-Haram Travel'}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 w-72 max-w-[80vw] h-full shadow-2xl">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFF] overflow-y-auto">
        {/* Top Header bar with Quick Details */}
        <header className="px-6 py-3.5 border-b border-gray-100 bg-white/80 backdrop-blur flex items-center justify-between text-xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-500">
              لائیو ایجنسی سیشن: <strong className="text-gray-900">{agency?.name || 'Al-Haram Travel Management'}</strong>
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
