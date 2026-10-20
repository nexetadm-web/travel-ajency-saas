import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1440px] space-y-6 sm:space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-36 bg-gray-200 rounded-lg" />
            <div className="flex items-center gap-3">
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-36 bg-gray-200 rounded-full" />
          <div className="h-9 w-32 bg-gray-100 rounded-full" />
        </div>
      </div>

      {/* Primary Executive Metrics Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <div className="min-h-[175px] rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100/60 p-5 border border-violet-200/40" />
          <div className="min-h-[175px] rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100/60 p-5 border border-emerald-200/40" />
          <div className="min-h-[175px] rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100/60 p-5 border border-amber-200/40" />
        </div>
      </div>

      {/* Second Row Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        <div className="min-h-[165px] rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100/60 p-5 border border-rose-200/40" />
        <div className="min-h-[165px] rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100/60 p-5 border border-cyan-200/40" />
        <div className="min-h-[165px] rounded-2xl bg-gradient-to-br from-slate-100 to-gray-200/60 p-5 border border-slate-200/40" />
        <div className="min-h-[165px] rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100/60 p-5 border border-green-200/40" />
      </div>

      {/* Quick Actions Skeleton */}
      <div>
        <div className="h-4 w-52 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 h-28 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-100" />
              <div className="w-16 h-3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
