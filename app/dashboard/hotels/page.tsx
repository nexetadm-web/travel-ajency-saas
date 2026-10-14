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
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import PremiumCard from '@/components/ui/premium-card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HotelsAndTransportPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'hotels' | 'transport'>('bookings');
  const [transportFilter, setTransportFilter] = useState('all');

  const { data: hotelsData, mutate: mutateHotels, isLoading: loadingHotels } = useSWR('/api/hotels', fetcher);
  const { data: bookingsData, mutate: mutateBookings, isLoading: loadingBookings } = useSWR('/api/hotels/bookings', fetcher);
  const { data: transportData, mutate: mutateTransport, isLoading: loadingTransport } = useSWR('/api/transport', fetcher);
  const { data: groupsData } = useSWR('/api/groups', fetcher);

  const hotels = hotelsData?.hotels || [];
  const bookings = bookingsData?.bookings || [];
  const transportList = transportData?.transportBookings || [];
  const groups = groupsData?.groups || [];

  // Modals state
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);

  // Status & Feedback messages
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Forms
  const [hotelForm, setHotelForm] = useState({
    name: '',
    city: 'Makkah',
    type: 'hotel_directory',
    price_per_night: '25000',
    contact_person: '',
  });

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

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelForm.name || !hotelForm.city) {
      setErrorMsg('براہ کرم ہوٹل کا نام اور شہر منتخب کریں');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotelForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ہوٹل شامل کرنے میں خرابی');
      }

      showToast('ہوٹل کامیابی سے شامل کر دیا گیا! ✅');
      setShowHotelModal(false);
      setHotelForm({
        name: '',
        city: 'Makkah',
        type: 'hotel_directory',
        price_per_night: '25000',
        contact_person: '',
      });
      mutateHotels();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.group_id || !bookingForm.hotel_id) {
      setErrorMsg('براہ کرم گروپ اور ہوٹل دونوں منتخب کریں');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/hotels/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'بکنگ محفوظ کرنے میں خرابی');
      }

      showToast('گروپ ہوٹل بکنگ کامیابی سے درج ہو گئی! ✅');
      setShowBookingModal(false);
      setBookingForm({
        group_id: '',
        hotel_id: '',
        check_in: '',
        check_out: '',
        total_rooms: '10',
        total_beds: '40',
        total_cost: '250000',
        advance_paid: '50000',
      });
      mutateBookings();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transportForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ٹرانسپورٹ محفوظ کرنے میں خرابی');
      }

      showToast('ٹرانسپورٹ بکنگ کامیابی سے درج ہو گئی! ✅');
      setShowTransportModal(false);
      setTransportForm({
        group_id: '',
        type: 'Bus',
        route: 'JED-MAK-MAD-JED',
        cost: '85000',
        date: '',
      });
      mutateTransport();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransports = transportList.filter((t: any) => {
    if (transportFilter === 'all') return true;
    return t.type?.toLowerCase() === transportFilter.toLowerCase();
  });

  const totalBookingCost = bookings.reduce((sum: number, b: any) => sum + (b.total_cost || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl shadow-md">
              🏨
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">ہوٹل اور ٹرانسپورٹیشن مینجمنٹ</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                مکہ و مدینہ ہوٹل بکنگز، روم و بیڈ الاٹمنٹ، بسیں اور روٹس
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'bookings' && (
            <button
              onClick={() => {
                setErrorMsg('');
                setShowBookingModal(true);
              }}
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + نئی ہوٹل بکنگ
            </button>
          )}
          {activeTab === 'hotels' && (
            <button
              onClick={() => {
                setErrorMsg('');
                setShowHotelModal(true);
              }}
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + نیا ہوٹل شامل کریں
            </button>
          )}
          {activeTab === 'transport' && (
            <button
              onClick={() => {
                setErrorMsg('');
                setShowTransportModal(true);
              }}
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + نئی ٹرانسپورٹ بکنگ
            </button>
          )}
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard
          title="مکہ مکرمہ ہوٹلز"
          value={hotels.filter((h: any) => (h.city || '').toLowerCase().includes('mak') || (h.city || '').includes('مکہ')).length || hotels.length}
          subtitle="حرم شریف کے قریبی ہوٹل"
          icon={Building2}
          gradient="violet"
          trend="مکہ ہوٹلز"
        />
        <PremiumCard
          title="مدینہ منورہ ہوٹلز"
          value={hotels.filter((h: any) => (h.city || '').toLowerCase().includes('mad') || (h.city || '').includes('مدینہ')).length}
          subtitle="مسجد نبوی کے قریبی ہوٹل"
          icon={MapPin}
          gradient="emerald"
          trend="مدینہ ہوٹلز"
        />
        <PremiumCard
          title="ٹرانسپورٹ گاڑیاں"
          value={transportList.length}
          subtitle="بس اور وی آئی پی روٹس"
          icon={Car}
          gradient="cyan"
          trend="گاڑیاں"
        />
        <PremiumCard
          title="کل بکنگ لاگت"
          value={formatCurrency(totalBookingCost)}
          subtitle="مجموعی ہوٹل اخراجات"
          icon={DollarSign}
          gradient="rose"
          trend="اخراجات"
        />
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          گروپ ہوٹل بکنگز ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'hotels'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          ہوٹلز ڈائریکٹری ({hotels.length})
        </button>

        <button
          onClick={() => setActiveTab('transport')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'transport'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Car className="w-4 h-4" />
          ٹرانسپورٹیشن ({transportList.length})
        </button>
      </div>

      {/* TAB 1: GROUP HOTEL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {loadingBookings ? (
            <div className="py-20 text-center text-gray-400">
              <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2 text-emerald-500" />
              <p className="text-xs">بکنگز لوڈ ہو رہی ہیں...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center rounded-[24px] bg-white border border-gray-100 text-gray-400 shadow-sm">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-500" />
              <p className="text-sm font-bold text-gray-700">کوئی ہوٹل بکنگ ریکارڈ نہیں ہے</p>
              <p className="text-xs text-gray-400 mt-1">
                اوپر دیے گئے بٹن پر کلک کر کے نئی گروپ ہوٹل بکنگ درج کریں
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bookings.map((b: any) => (
                <div
                  key={b.id}
                  className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-emerald-200 transition space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-base text-gray-900">{b.hotel_name || 'ہوٹل بکنگ'}</h3>
                      <span className="text-xs text-emerald-700 font-bold block mt-0.5">
                        {b.group_name || 'شیڈولڈ گروپ'}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      {b.city || 'Makkah'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>چیک اِن:</span>
                      <span className="text-gray-900 font-bold">{formatDate(b.check_in)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>چیک آؤٹ:</span>
                      <span className="text-gray-900 font-bold">{formatDate(b.check_out)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>کمرے و بیڈز:</span>
                      <span className="text-amber-700 font-bold">{b.total_rooms} کمرے ({b.total_beds} بیڈز)</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">کل لاگت:</span>
                      <strong className="text-emerald-600 font-black text-sm">{formatCurrency(b.total_cost)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block text-[10px]">پیشگی ادا شدہ:</span>
                      <strong className="text-gray-900 font-bold">{formatCurrency(b.advance_paid)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HOTELS DIRECTORY */}
      {activeTab === 'hotels' && (
        <div className="space-y-4">
          {loadingHotels ? (
            <div className="py-20 text-center text-gray-400">
              <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2 text-indigo-500" />
              <p className="text-xs">ہوٹلز لسٹ لوڈ ہو رہی ہے...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="p-12 text-center rounded-[24px] bg-white border border-gray-100 text-gray-400 shadow-sm">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
              <p className="text-sm font-bold text-gray-700">کوئی ہوٹل رجسٹر نہیں ہے</p>
              <p className="text-xs text-gray-400 mt-1">
                اوپر بٹن پر کلک کر کے مکہ یا مدینہ کا نیا ہوٹل شامل کریں
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {hotels.map((h: any) => (
                <div
                  key={h.id}
                  className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-indigo-200 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-base text-gray-900">{h.name || h.hotel_name}</h3>
                      <span className="text-xs text-indigo-600 font-bold block mt-0.5">{h.city}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                      {formatCurrency(h.price_per_night || h.per_night_rate)} / رات
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 flex items-center justify-between">
                    <span>رابطہ شخص / نمبر:</span>
                    <strong className="text-gray-800 font-mono">{h.contact_person || h.contact || '-'}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRANSPORTATION */}
      {activeTab === 'transport' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={transportFilter}
              onChange={(e) => setTransportFilter(e.target.value)}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-500 shadow-sm"
            >
              <option value="all">تمام قسم کی ٹرانسپورٹ</option>
              <option value="bus">بس (Bus)</option>
              <option value="coaster">کوسٹر (Coaster)</option>
              <option value="gmc">GMC / SUV</option>
              <option value="hiace">ہائی ایس (Hiace)</option>
              <option value="train">حرمین ٹرین (Train)</option>
            </select>
          </div>

          {loadingTransport ? (
            <div className="py-20 text-center text-gray-400">
              <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2 text-teal-500" />
              <p className="text-xs">ٹرانسپورٹ لوڈ ہو رہی ہے...</p>
            </div>
          ) : filteredTransports.length === 0 ? (
            <div className="p-12 text-center rounded-[24px] bg-white border border-gray-100 text-gray-400 shadow-sm">
              <Car className="w-12 h-12 mx-auto mb-3 opacity-30 text-teal-500" />
              <p className="text-sm font-bold text-gray-700">کوئی ٹرانسپورٹ روٹ نہیں ملا</p>
              <p className="text-xs text-gray-400 mt-1">
                نئی ٹرانسپورٹ بکنگ بٹن سے شیڈول شامل کریں
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTransports.map((t: any) => (
                <div
                  key={t.id}
                  className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-teal-200 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-base text-gray-900">{t.type}</h3>
                      <span className="text-xs text-teal-600 font-mono font-bold block mt-0.5">{t.route}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                      {formatCurrency(t.cost)}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 flex items-center justify-between">
                    <span>تاریخ و گروپ:</span>
                    <strong className="text-gray-800">{t.group_name || 'شیڈولڈ'} ({formatDate(t.date)})</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD HOTEL */}
      {showHotelModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 text-base">🏨 نیا ہوٹل شامل کریں</h3>
              <button
                onClick={() => setShowHotelModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateHotel} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ہوٹل کا نام *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. سوئس ہوٹل المبین یا دار التوحید"
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">شہر *</label>
                  <select
                    value={hotelForm.city}
                    onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Makkah">مکہ مکرمہ (Makkah)</option>
                    <option value="Madinah">مدینہ منورہ (Madinah)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">قسم</label>
                  <select
                    value={hotelForm.type}
                    onChange={(e) => setHotelForm({ ...hotelForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="hotel_directory">ہوٹل ڈائریکٹری</option>
                    <option value="group_hotel_booking">گروپ بُکنگ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">کرایہ فی رات (روپے / ریال)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="25000"
                  value={hotelForm.price_per_night}
                  onChange={(e) => setHotelForm({ ...hotelForm, price_per_night: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رابطہ کار یا فون نمبر</label>
                <input
                  type="text"
                  placeholder="+966 50 123 4567"
                  value={hotelForm.contact_person}
                  onChange={(e) => setHotelForm({ ...hotelForm, contact_person: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHotelModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>محفوظ کریں</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD HOTEL BOOKING */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 text-base">📅 نئی گروپ ہوٹل بکنگ</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">عمرہ / حج گروپ *</label>
                  <select
                    required
                    value={bookingForm.group_id}
                    onChange={(e) => setBookingForm({ ...bookingForm, group_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">گروپ منتخب کریں...</option>
                    {groups.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.group_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ہوٹل منتخب کریں *</label>
                  <select
                    required
                    value={bookingForm.hotel_id}
                    onChange={(e) => setBookingForm({ ...bookingForm, hotel_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">ہوٹل منتخب کریں...</option>
                    {hotels.map((h: any) => (
                      <option key={h.id} value={h.id}>{h.name || h.hotel_name} ({h.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">چیک اِن تاریخ</label>
                  <input
                    type="date"
                    value={bookingForm.check_in}
                    onChange={(e) => setBookingForm({ ...bookingForm, check_in: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">چیک آؤٹ تاریخ</label>
                  <input
                    type="date"
                    value={bookingForm.check_out}
                    onChange={(e) => setBookingForm({ ...bookingForm, check_out: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کمروں کی تعداد</label>
                  <input
                    type="number"
                    value={bookingForm.total_rooms}
                    onChange={(e) => setBookingForm({ ...bookingForm, total_rooms: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کل بیڈز</label>
                  <input
                    type="number"
                    value={bookingForm.total_beds}
                    onChange={(e) => setBookingForm({ ...bookingForm, total_beds: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کل لاگت (روپے)</label>
                  <input
                    type="number"
                    value={bookingForm.total_cost}
                    onChange={(e) => setBookingForm({ ...bookingForm, total_cost: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">پیشگی ادا شدہ (Advance)</label>
                  <input
                    type="number"
                    value={bookingForm.advance_paid}
                    onChange={(e) => setBookingForm({ ...bookingForm, advance_paid: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>بکنگ کنفرم کریں</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD TRANSPORT */}
      {showTransportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 text-base">🚐 نئی ٹرانسپورٹ بکنگ</h3>
              <button
                onClick={() => setShowTransportModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateTransport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">عمرہ گروپ (اختیاری)</label>
                <select
                  value={transportForm.group_id}
                  onChange={(e) => setTransportForm({ ...transportForm, group_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">شیڈولڈ یا کوئی گروپ نہیں...</option>
                  {groups.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.group_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">گاڑی کی قسم *</label>
                  <select
                    value={transportForm.type}
                    onChange={(e) => setTransportForm({ ...transportForm, type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Bus">بس (Bus 50 Seater)</option>
                    <option value="Coaster">کوسٹر (Coaster)</option>
                    <option value="GMC">جی ایم سی (GMC SUV)</option>
                    <option value="Hiace">ہائی ایس (Hiace)</option>
                    <option value="Train">حرمین ٹرین (Train)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کرایہ / لاگت (روپے)</label>
                  <input
                    type="number"
                    value={transportForm.cost}
                    onChange={(e) => setTransportForm({ ...transportForm, cost: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">روٹ (Route)</label>
                <input
                  type="text"
                  placeholder="e.g. JED-MAK-MAD-JED"
                  value={transportForm.route}
                  onChange={(e) => setTransportForm({ ...transportForm, route: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">تاریخ سفر</label>
                <input
                  type="date"
                  value={transportForm.date}
                  onChange={(e) => setTransportForm({ ...transportForm, date: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransportModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>محفوظ کریں</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
