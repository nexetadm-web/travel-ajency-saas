'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Building2,
  Plus,
  Calendar,
  Car,
  MapPin,
  Phone,
  BedDouble,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HotelsAndTransportPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'hotels' | 'transport'>('bookings');

  const { data: hotelsData, mutate: mutateHotels } = useSWR('/api/hotels', fetcher);
  const { data: bookingsData, mutate: mutateBookings } = useSWR('/api/hotels/bookings', fetcher);
  const { data: transportData, mutate: mutateTransport } = useSWR('/api/transport', fetcher);
  const { data: groupsData } = useSWR('/api/groups', fetcher);

  const hotels = hotelsData?.hotels || [];
  const bookings = bookingsData?.bookings || [];
  const transportList = transportData?.transportBookings || [];
  const groups = groupsData?.groups || [];

  // Modals
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);

  // Forms
  const [hotelForm, setHotelForm] = useState({ city: 'Makkah', hotel_name: '', per_night_rate: '25000', contact: '' });
  const [bookingForm, setBookingForm] = useState({
    group_id: '',
    hotel_id: '',
    check_in: '',
    check_out: '',
    total_rooms: '10',
    total_beds: '40',
    total_cost: '250000',
    advance_paid: '50000',
  });
  const [transportForm, setTransportForm] = useState({
    group_id: '',
    type: 'Bus',
    route: 'JED-MAK-MAD-JED',
    cost: '85000',
    date: '',
  });

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/hotels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotelForm),
    });
    mutateHotels();
    setShowHotelModal(false);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/hotels/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingForm),
    });
    mutateBookings();
    setShowBookingModal(false);
  };

  const handleCreateTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/transport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transportForm),
    });
    mutateTransport();
    setShowTransportModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">ہوٹل اور ٹرانسپورٹیشن مینجمنٹ</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
              ماڈیول 4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            مکہ و مدینہ ہوٹل بکنگز، روم و بیڈ الاٹمنٹ، روٹس اور شیڈول
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'bookings' && (
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + نئی ہوٹل بکنگ
            </button>
          )}
          {activeTab === 'hotels' && (
            <button
              onClick={() => setShowHotelModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + نیا ہوٹل شامل کریں
            </button>
          )}
          {activeTab === 'transport' && (
            <button
              onClick={() => setShowTransportModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + نئی ٹرانسپورٹ بکنگ
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          گروپ ہوٹل بکنگز ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'hotels'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          ہوٹلز ڈائریکٹری ({hotels.length})
        </button>

        <button
          onClick={() => setActiveTab('transport')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'transport'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          ٹرانسپورٹیشن ({transportList.length})
        </button>
      </div>

      {/* TAB 1: GROUP HOTEL BOOKINGS & CALENDAR VIEW */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((b: any) => (
              <div
                key={b.id}
                className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-base text-white block">
                      {b.hotel_name || 'Al Safwa Hotel'}
                    </span>
                    <span className="text-xs text-amber-400 font-medium">
                      {b.city || 'Makkah'} | گروپ: {b.group_name || 'عام الاٹمنٹ'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                    {b.total_rooms} کمرے
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>چیک اِن:</span>
                    <span className="text-white font-semibold">{formatDate(b.check_in)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>چیک آؤٹ:</span>
                    <span className="text-white font-semibold">{formatDate(b.check_out)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>کل بیڈز:</span>
                    <span className="text-amber-400 font-bold">{b.total_beds} بیڈز</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">کل بکنگ لاگت:</span>
                    <strong className="text-emerald-400">{formatCurrency(b.total_cost)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">پیشگی ادا شدہ:</span>
                    <strong className="text-white">{formatCurrency(b.advance_paid)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {bookings.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
              <p className="text-sm font-semibold">کوئی ہوٹل بکنگ ریکارڈ نہیں ہے</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HOTELS DIRECTORY */}
      {activeTab === 'hotels' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotels.map((h: any) => (
            <div key={h.id} className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{h.hotel_name}</h3>
                  <span className="text-xs text-amber-400 font-medium">{h.city}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                  {formatCurrency(h.per_night_rate)} / رات
                </span>
              </div>
              <p className="text-xs text-slate-400">رابطہ نمبر: {h.contact || '-'}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: TRANSPORTATION */}
      {activeTab === 'transport' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {transportList.map((t: any) => (
            <div key={t.id} className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{t.type}</h3>
                  <span className="text-xs text-teal-400 font-mono font-bold">{t.route}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold">
                  {formatCurrency(t.cost)}
                </span>
              </div>
              <p className="text-xs text-slate-400">گروپ: {t.group_name || 'Scheduled'} | تاریخ: {formatDate(t.date)}</p>
            </div>
          ))}
        </div>
      )}

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">+ نئی گروپ ہوٹل بکنگ</h3>
            <form onSubmit={handleCreateBooking} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">گروپ منتخب کریں</label>
                <select
                  value={bookingForm.group_id}
                  onChange={(e) => setBookingForm({ ...bookingForm, group_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="">گروپ منتخب کریں...</option>
                  {groups.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.group_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">ہوٹل منتخب کریں</label>
                <select
                  value={bookingForm.hotel_id}
                  onChange={(e) => setBookingForm({ ...bookingForm, hotel_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="">ہوٹل منتخب کریں...</option>
                  {hotels.map((h: any) => (
                    <option key={h.id} value={h.id}>{h.hotel_name} ({h.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">چیک اِن تاریخ</label>
                  <input
                    type="date"
                    value={bookingForm.check_in}
                    onChange={(e) => setBookingForm({ ...bookingForm, check_in: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">چیک آؤٹ تاریخ</label>
                  <input
                    type="date"
                    value={bookingForm.check_out}
                    onChange={(e) => setBookingForm({ ...bookingForm, check_out: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">کمرے</label>
                  <input
                    type="number"
                    value={bookingForm.total_rooms}
                    onChange={(e) => setBookingForm({ ...bookingForm, total_rooms: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">بیڈز</label>
                  <input
                    type="number"
                    value={bookingForm.total_beds}
                    onChange={(e) => setBookingForm({ ...bookingForm, total_beds: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">کل لاگت (Cost)</label>
                  <input
                    type="number"
                    value={bookingForm.total_cost}
                    onChange={(e) => setBookingForm({ ...bookingForm, total_cost: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">پیشگی ادا شدہ</label>
                  <input
                    type="number"
                    value={bookingForm.advance_paid}
                    onChange={(e) => setBookingForm({ ...bookingForm, advance_paid: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
