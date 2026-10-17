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
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-500/20 shrink-0">
            {agency?.name ? agency.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-sm text-gray-900 truncate flex items-center gap-1.5">
              <span className="truncate">{agency?.name || 'Pyary Travels'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
            </div>
            <div className="text-[10px] text-gray-500 truncate font-medium">
              {agency?.license_no ? `لائسنس: ${agency.license_no}` : 'عمرہ مینجمنٹ پورٹل'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200 transition shadow-sm"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] h-full shadow-2xl overflow-y-auto bg-[#0f172a]">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFF] overflow-x-hidden overflow-y-auto w-full max-w-full">
        {/* Desktop Top Header bar (hidden on mobile to prevent clutter) */}
        <header className="hidden md:flex px-6 py-3.5 border-b border-gray-100 bg-white/80 backdrop-blur items-center justify-between text-xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-500">
              لائیو ایجنسی سیشن: <strong className="text-gray-900">{agency?.name || 'Pyary Travels Management'}</strong>
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
        <main className="p-3 sm:p-4 md:p-6 flex-1 w-full max-w-full overflow-x-hidden pb-12 sm:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
