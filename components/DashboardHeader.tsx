'use client';

import React from 'react';
import Link from 'next/link';
import { User as UserIcon, Phone } from 'lucide-react';
import { useAgency } from '@/hooks/useAgency';

export default function DashboardHeader() {
  const { agency } = useAgency();

  const agencyName = agency?.name || 'Pyary Tarvels';
  const ownerName = agency?.owner_name || 'Naveed Bhatti';
  const phone = agency?.phone || '03400072030';
  const licenseNo = agency?.license_no || 'PNT-PK-26';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-emerald-100">
          {agency?.logo_url ? (
            <img
              src={agency.logo_url}
              alt={agencyName}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="/logo.png"
              alt={agencyName}
              className="w-8 h-8 object-contain"
            />
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="font-urdu text-[18px] lg:text-[16px] font-bold leading-none text-gray-900">
              {agencyName}
            </h2>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-english font-medium">
              ایڈمن پینل
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[12px] lg:text-[11px] text-gray-500">
              <UserIcon size={12} className="shrink-0 text-gray-400" />
              <span>{ownerName}</span>
            </span>
            <span className="flex items-center gap-1 text-[12px] lg:text-[11px] text-gray-500">
              <Phone size={12} className="shrink-0 text-gray-400" />
              <span>{phone}</span>
            </span>
            <span className="flex items-center gap-1 text-[12px] lg:text-[11px] text-gray-500 font-mono">
              {licenseNo}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <Link
          href="/dashboard/pilgrims/new"
          prefetch={true}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-urdu text-[13px] lg:text-[12px] px-5 py-2 rounded-full flex items-center gap-1.5 transition shadow-sm font-semibold shrink-0"
        >
          + نیا حاجی (New Pilgrim)
        </Link>
        <Link
          href="/dashboard/groups"
          prefetch={true}
          className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-urdu text-[13px] lg:text-[12px] px-5 py-2 rounded-full flex items-center gap-1.5 transition shadow-sm font-semibold shrink-0"
        >
          + نیا گروپ (New Group)
        </Link>
      </div>
    </div>
  );
}
