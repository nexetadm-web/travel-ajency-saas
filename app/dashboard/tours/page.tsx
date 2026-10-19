'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Compass,
  Plane,
  MapPin,
  Calendar,
  Users,
  Plus,
  Filter,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAgency } from '@/hooks/useAgency';
import PremiumCard from '@/components/ui/premium-card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TourPackagesPage() {
  const { agency } = useAgency();
  const [filterType, setFilterType] = useState('all');
  const [showNewPkgModal, setShowNewPkgModal] = useState(false);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);

  // New Package State
  const [newPkg, setNewPkg] = useState({
    package_name: '',
    type: 'domestic',
    destination: '',
    duration_days: '5',
    price_per_person: '45000',
    includes: 'لگژری ہوٹل، 4x4 جیپ، ناشتہ، گائیڈ',
    max_seats: '20',
    departure_dates: '15 نومبر 2026',
  });
  const [submittingPkg, setSubmittingPkg] = useState(false);

  // New Booking State
  const [newBooking, setNewBooking] = useState({
    client_name: '',
    phone: '',
    cnic: '',
    persons: '2',
    total_amount: '90000',
    advance: '30000',
    travel_date: '2026-11-15',
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const { data, mutate, isLoading } = useSWR(`/api/tours?type=${filterType}`, fetcher);
  const { data: detailData, mutate: mutateDetail } = useSWR(
    selectedPkgId ? `/api/tours/${selectedPkgId}` : null,
    fetcher
  );

  const packages = data?.packages || [];

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkg.package_name || !newPkg.destination) return;

    setSubmittingPkg(true);
    try {
      const res = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPkg),
      });

      if (res.ok) {
        setShowNewPkgModal(false);
        setNewPkg({
          package_name: '',
          type: 'domestic',
          destination: '',
          duration_days: '5',
          price_per_person: '45000',
          includes: 'لگژری ہوٹل، 4x4 جیپ، ناشتہ، گائیڈ',
          max_seats: '20',
          departure_dates: '15 نومبر 2026',
        });
        mutate();
      } else {
        const err = await res.json();
        alert(err.error || 'پیکیج بنانے میں خرابی');
      }
    } catch (err: any) {
      alert(err.message || 'نیٹ ورک خرابی');
    } finally {
      setSubmittingPkg(false);
    }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkgId || !newBooking.client_name) return;

    setSubmittingBooking(true);
    try {
      const res = await fetch('/api/tours/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: selectedPkgId,
          ...newBooking,
        }),
      });

      if (res.ok) {
        setShowAddBookingModal(false);
        setNewBooking({
          client_name: '',
          phone: '',
          cnic: '',
          persons: '2',
          total_amount: '90000',
          advance: '30000',
          travel_date: '2026-11-15',
        });
        mutate();
        mutateDetail();
      } else {
        const err = await res.json();
        alert(err.error || 'بکنگ بنانے میں خرابی');
      }
    } catch (err: any) {
      alert(err.message || 'نیٹ ورک خرابی');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const totalTours = packages.length;
  const totalBookings = packages.reduce((acc: number, p: any) => acc + (p.bookingsCount || 0), 0);
  const tourRevenue = packages.reduce((acc: number, p: any) => acc + ((p.bookedPersons || 0) * (Number(p.price_per_person) || 0)), 0);
  const netProfit = Math.round(tourRevenue * 0.22);

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden transform-none" style={{ transform: 'none' }}>
        <div dir="rtl" className="text-right transform-none" style={{ transform: 'none' }}>
          <h1 className="font-urdu text-[28px] md:text-[32px] font-bold text-right leading-[2.2] transform-none rotate-0 not-italic" dir="rtl" style={{ transform: 'none', fontStyle: 'normal' }}>
            ✈️ ٹور پیکجز
          </h1>
          <p className="font-urdu text-sm text-gray-600 text-right transform-none" dir="rtl">
            کل پیکیجز: {totalTours} <span className="font-english text-xs text-teal-700 font-semibold">(Domestic & International Tours)</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 break-words leading-relaxed transform-none">
            ہنزہ، اسکردو، سوات، دبئی، باکو اور ترکیہ کے ٹور پیکجز، سیٹیں، واؤچرز اور مکمل منافع کھاتہ
          </p>
        </div>

        <button
          onClick={() => setShowNewPkgModal(true)}
          className="font-urdu bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 transform-none shadow-md transition"
          style={{ transform: 'none' }}
        >
          <span>+</span> <span>نیا ٹور پیکیج</span> <span className="font-english text-xs">(Add Package)</span>
        </button>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard
          title="ٹوٹل ٹورز"
          value={totalTours}
          subtitle="فعال پیکجز"
          icon={Compass}
          gradient="violet"
          trend="تمام ٹورز"
        />
        <PremiumCard
          title="کل بکنگز"
          value={totalBookings}
          subtitle="بک شدہ زائرین و سیاح"
          icon={Users}
          gradient="cyan"
          trend="کنفرمڈ"
        />
        <PremiumCard
          title="ٹور ریونیو"
          value={formatCurrency(tourRevenue)}
          subtitle="مجموعی بکنگ آمدن"
          icon={DollarSign}
          gradient="emerald"
          trend="آمدنی"
        />
        <PremiumCard
          title="تخمینہ منافع"
          value={formatCurrency(netProfit)}
          subtitle="نیٹ پرافٹ مارجن"
          icon={TrendingUp}
          gradient="rose"
          trend="منافع"
        />
      </div>

      {/* FILTER BUTTONS: ALL / DOMESTIC / INTERNATIONAL */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filterType === 'all'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          تمام ٹور پیکجز ({packages.length})
        </button>

        <button
          onClick={() => setFilterType('domestic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filterType === 'domestic'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          اندرون ملک ٹورز (Domestic - ہنزہ/اسکردو/سوات)
        </button>

        <button
          onClick={() => setFilterType('international')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filterType === 'international'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Plane className="w-4 h-4" />
          بیرون ملک ٹورز (International - دبئی/باکو/ترکیہ)
        </button>
      </div>

      {/* PACKAGES GRID */}
      {isLoading ? (
        <div className="py-20 text-center text-gray-400">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-xs">ٹور پیکجز لوڈ ہو رہے ہیں...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="p-12 text-center rounded-[24px] bg-white border border-gray-100 text-gray-400 shadow-sm">
          <Compass className="w-12 h-12 mx-auto mb-3 opacity-30 text-teal-600" />
          <p className="text-sm font-semibold text-gray-700">کوئی ٹور پیکیج نہیں ملا</p>
          <p className="text-xs text-gray-400 mt-1">نیا پیکیج بنانے کے لیے اوپر بٹن دبائیں۔</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg: any) => {
            const occupancyPct = Math.min(
              100,
              Math.round(((pkg.bookedPersons || 0) / (pkg.max_seats || 20)) * 100)
            );
            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header Banner */}
                  <div className={`p-4 text-white ${
                    pkg.type === 'international'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-600'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase">
                        {pkg.type === 'international' ? 'International' : 'Domestic Tour'}
                      </span>
                      <span className="text-xs font-semibold text-white/90">
                        {pkg.duration_days} دن کا ٹور
                      </span>
                    </div>

                    <h3 className="text-base font-black tracking-tight">{pkg.package_name}</h3>
                    <p className="text-xs text-white/90 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      منزل: {pkg.destination}
                    </p>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 space-y-3">
                    {/* Price and Seats */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                      <div>
                        <span className="text-[11px] text-gray-400 block">فی فرد قیمت:</span>
                        <strong className="text-[13px] font-bold text-gray-900">
                          {formatCurrency(pkg.price_per_person)}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-gray-400 block">باقی سیٹیں:</span>
                        <span className="text-xs font-black text-emerald-600">
                          {pkg.availableSeats} / {pkg.max_seats}
                        </span>
                      </div>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                        <span>بکنگ تناسب:</span>
                        <span className="font-bold text-gray-700">{occupancyPct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            occupancyPct > 80 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                      <span className="text-[10px] font-bold text-gray-400 block mb-0.5">شامل خدمات:</span>
                      <p className="text-gray-700 font-medium truncate">{pkg.includes || 'مکمل سہولیات'}</p>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-700 border border-gray-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>تفصیلات اور بکنگز کھولیں ({pkg.bookingsCount})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: NEW TOUR PACKAGE */}
      {showNewPkgModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-bold text-gray-900">+ نیا ٹور پیکیج بنائیں</h3>
              <button
                onClick={() => setShowNewPkgModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">پیکیج کا نام *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hunza Autumn 5 Days Tour"
                  value={newPkg.package_name}
                  onChange={(e) => setNewPkg({ ...newPkg, package_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ٹور قسم</label>
                  <select
                    value={newPkg.type}
                    onChange={(e) => setNewPkg({ ...newPkg, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="domestic">اندرون ملک (Domestic)</option>
                    <option value="international">بیرون ملک (International)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">منزل (Destination)*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ہنزہ / دبئی"
                    value={newPkg.destination}
                    onChange={(e) => setNewPkg({ ...newPkg, destination: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">مدت (دن)</label>
                  <input
                    type="number"
                    value={newPkg.duration_days}
                    onChange={(e) => setNewPkg({ ...newPkg, duration_days: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">قیمت فی فرد</label>
                  <input
                    type="number"
                    value={newPkg.price_per_person}
                    onChange={(e) => setNewPkg({ ...newPkg, price_per_person: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کل سیٹیں</label>
                  <input
                    type="number"
                    value={newPkg.max_seats}
                    onChange={(e) => setNewPkg({ ...newPkg, max_seats: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">شامل خدمات (Includes)</label>
                <input
                  type="text"
                  value={newPkg.includes}
                  onChange={(e) => setNewPkg({ ...newPkg, includes: e.target.value })}
                  placeholder="ہوٹل رہائش، 4x4 جیپ، ناشتہ و ٹور گائیڈ"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewPkgModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={submittingPkg}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  {submittingPkg ? 'پیکیج بنایا جا رہا ہے...' : '✓ پیکیج بنائیں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PACKAGE DETAILS & BOOKINGS & PROFIT */}
      {selectedPkgId && detailData?.package && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl my-8 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-gray-900">{detailData.package.package_name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold text-xs uppercase">
                    {detailData.package.destination} ({detailData.package.duration_days} Days)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  فی فرد قیمت: <strong className="text-gray-900">{formatCurrency(detailData.package.price_per_person)}</strong> | باقی سیٹیں: <strong className="text-emerald-600">{detailData.stats.seatsLeft}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddBookingModal(true)}
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + نئی بکنگ درج کریں
                </button>
                <button
                  onClick={() => setSelectedPkgId(null)}
                  className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* PROFIT FINANCIAL BREAKDOWN CARD */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border border-emerald-200 text-xs">
              <div>
                <span className="text-emerald-800 block text-[11px]">کل مسافرین:</span>
                <strong className="text-base font-black text-emerald-950">{detailData.stats.totalPersons} مسافر</strong>
              </div>
              <div>
                <span className="text-emerald-800 block text-[11px]">مجموعی ریونیو:</span>
                <strong className="text-base font-black text-emerald-700">{formatCurrency(detailData.stats.totalRevenue)}</strong>
              </div>
              <div>
                <span className="text-emerald-800 block text-[11px]">تخمینی آپریٹنگ لاگت:</span>
                <strong className="text-base font-bold text-gray-700">{formatCurrency(detailData.stats.estimatedCost)}</strong>
              </div>
              <div>
                <span className="text-emerald-800 block text-[11px]">خالص منافع (Net Profit):</span>
                <strong className="text-base font-black text-teal-800">{formatCurrency(detailData.stats.netProfit)}</strong>
              </div>
            </div>

            {/* BOOKINGS TABLE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                بکنگز لسٹ اور تصدیقی واؤچرز (Tour Bookings & Vouchers)
              </h4>

              <div className="rounded-2xl border border-gray-100 overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5">کلائنٹ نام</th>
                      <th className="p-3.5">فون / رابطہ</th>
                      <th className="p-3.5">افراد</th>
                      <th className="p-3.5">کل رقم</th>
                      <th className="p-3.5">ایڈوانس</th>
                      <th className="p-3.5">بقایا</th>
                      <th className="p-3.5 text-center">واؤچر PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(detailData.bookings || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">
                          اس پیکیج میں ابھی کوئی بکنگ درج نہیں ہوئی۔
                        </td>
                      </tr>
                    ) : (
                      (detailData.bookings || []).map((b: any) => (
                        <tr key={b.id} className="hover:bg-gray-50/60 transition">
                          <td className="p-3.5 font-bold text-gray-900">{b.client_name}</td>
                          <td className="p-3.5 text-gray-500">{b.phone || '-'}</td>
                          <td className="p-3.5 font-bold">{b.persons}</td>
                          <td className="p-3.5 font-bold">{formatCurrency(b.total_amount)}</td>
                          <td className="p-3.5 text-emerald-600 font-bold">{formatCurrency(b.advance)}</td>
                          <td className="p-3.5 text-rose-600 font-bold">
                            {formatCurrency((b.total_amount || 0) - (b.advance || 0))}
                          </td>
                          <td className="p-3.5 text-center">
                            <a
                              href={`/api/pdf/tour-voucher/${b.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 font-bold text-[11px] transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              واؤچر PDF
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD BOOKING TO SELECTED PACKAGE */}
      {showAddBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-bold text-gray-900">+ نئی ٹور بکنگ درج کریں</h3>
              <button
                onClick={() => setShowAddBookingModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">لیڈ مسافر کا نام *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. عثمان خان"
                  value={newBooking.client_name}
                  onChange={(e) => setNewBooking({ ...newBooking, client_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">فون نمبر (WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">شناختی کارڈ (CNIC)</label>
                  <input
                    type="text"
                    placeholder="35202-0000000-0"
                    value={newBooking.cnic}
                    onChange={(e) => setNewBooking({ ...newBooking, cnic: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">افراد کی تعداد</label>
                  <input
                    type="number"
                    min="1"
                    value={newBooking.persons}
                    onChange={(e) => {
                      const persons = Number(e.target.value) || 1;
                      const rate = detailData?.package?.price_per_person || 45000;
                      setNewBooking({
                        ...newBooking,
                        persons: String(persons),
                        total_amount: String(persons * rate),
                      });
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کل رقم (PKR)</label>
                  <input
                    type="number"
                    value={newBooking.total_amount}
                    onChange={(e) => setNewBooking({ ...newBooking, total_amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ایڈوانس وصولی</label>
                  <input
                    type="number"
                    value={newBooking.advance}
                    onChange={(e) => setNewBooking({ ...newBooking, advance: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddBookingModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  {submittingBooking ? 'محفوظ ہو رہا ہے...' : '✓ بکنگ درج کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
