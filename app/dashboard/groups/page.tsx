'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Users,
  Plus,
  Calendar,
  Plane,
  Building2,
  DollarSign,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import dayjs from 'dayjs';
import { formatCurrency, formatDate } from '@/lib/utils';
import PremiumCard from '@/components/ui/premium-card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GroupsPage() {
  const { data, mutate, isLoading } = useSWR('/api/groups', fetcher);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    group_name: '',
    departure_date: '',
    return_date: '',
    airline: 'Saudi Airlines',
    total_seats: '40',
    makkah_hotel: 'Swissotel Makkah',
    madina_hotel: 'Anwar Al Madinah',
    price_per_person: '285000',
  });

  const groups = data?.groups || [];

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || 'گروپ بنانے میں خرابی');
        setSubmitting(false);
        return;
      }

      mutate();
      setShowModal(false);
      setFormData({
        group_name: '',
        departure_date: '',
        return_date: '',
        airline: 'Saudi Airlines',
        total_seats: '40',
        makkah_hotel: 'Swissotel Makkah',
        madina_hotel: 'Anwar Al Madinah',
        price_per_person: '285000',
      });
    } catch (err: any) {
      setErrorMsg('نیٹ ورک ایرر: دوبارہ کوشش کریں');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDaysLeft = (depDate?: string | null) => {
    if (!depDate) return null;
    const diff = dayjs(depDate).diff(dayjs(), 'day');
    return diff;
  };

  const totalGroups = groups.length;
  const activeGroups = groups.filter((g: any) => g.status === 'open' || !g.status).length;
  const completedGroups = groups.filter((g: any) => g.status === 'closed' || g.status === 'completed').length;
  const totalRevenue = groups.reduce((acc: number, g: any) => acc + ((g.booked_seats || 0) * (Number(g.price_per_person) || 0)), 0);

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-4 md:p-5 lg:p-5 xl:p-6 shadow-sm border border-gray-100 lg:min-h-[90px] xl:min-h-[100px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden transform-none" style={{ transform: 'none' }}>
        <div dir="rtl" className="text-right transform-none" style={{ transform: 'none' }}>
          <h1 className="font-urdu text-[22px] md:text-[24px] lg:text-[22px] xl:text-[24px] font-bold text-right leading-[1.6] transform-none rotate-0 not-italic text-gray-900" dir="rtl" style={{ transform: 'none', fontStyle: 'normal' }}>
            عمرہ و حج گروپ مینجمنٹ
          </h1>
          <p className="font-urdu text-[12px] lg:text-[11px] text-gray-500 mt-1 text-right transform-none" dir="rtl">
            کل گروپس: {totalGroups} <span className="font-english text-[11px] text-emerald-700 font-semibold">(Umrah & Hajj Groups)</span> — گروپس اوکیوپینسی، سیٹ الاٹمنٹ اور کاؤنٹ ڈاؤن
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="font-urdu bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] lg:text-[12px] px-4 py-2 lg:px-3.5 lg:py-2 rounded-full flex items-center gap-1.5 transform-none shadow-md transition shrink-0"
          style={{ transform: 'none' }}
        >
          <span>+</span> <span>نیا گروپ بنائیں</span> <span className="font-english text-[11px]">(New Group)</span>
        </button>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard
          title="ٹوٹل گروپس"
          value={totalGroups}
          subtitle="فعال اور مکمل گروپس"
          icon={Users}
          gradient="violet"
          trend="تمام ادوار"
        />
        <PremiumCard
          title="فعال گروپس"
          value={activeGroups}
          subtitle="بکنگ جاری ہے"
          icon={Sparkles}
          gradient="amber"
          trend="اوپن فار بکنگ"
        />
        <PremiumCard
          title="مکمل گروپس"
          value={completedGroups}
          subtitle="سفر مکمل ہو چکا"
          icon={CheckCircle2}
          gradient="emerald"
          trend="کلوزڈ"
        />
        <PremiumCard
          title="گروپ ریونیو"
          value={formatCurrency(totalRevenue)}
          subtitle="مجموعی بک شدہ مالیت"
          icon={DollarSign}
          gradient="rose"
          trend="آمدن"
        />
      </div>

      {/* Groups List Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-sm">گروپس لوڈ ہو رہے ہیں...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="p-16 text-center rounded-[24px] bg-white border border-gray-100 text-gray-400 shadow-sm">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-600" />
          <h3 className="text-base font-bold text-gray-800">کوئی گروپ موجود نہیں</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            اوپر دیے گئے بٹن پر کلک کر کے اپنا پہلا عمرہ یا حج گروپ بنائیں جیسے کہ "Umrah Group 15 Dec 2026 - 40 Persons"۔
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-200"
          >
            + پہلا گروپ بنائیں
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((grp: any) => {
            const booked = grp.booked_seats || 0;
            const total = grp.total_seats || 40;
            const percentage = Math.min(100, Math.round((booked / total) * 100));
            const daysLeft = calculateDaysLeft(grp.departure_date);

            return (
              <div
                key={grp.id}
                className="rounded-[24px] bg-white border border-gray-100 overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between group"
              >
                {/* Top Gradient Strip */}
                <div className="h-2.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    {/* Card Header & Countdown */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                        {grp.status === 'open' ? 'بکنگ جاری ہے (Open)' : 'مکمل (Closed)'}
                      </span>

                      {daysLeft !== null && (
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                          daysLeft <= 7
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {daysLeft > 0 ? `روانگی: ${daysLeft} دن باقی` : 'روانہ ہو چکا'}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-600 transition leading-snug">
                      {grp.group_name}
                    </h3>

                    {/* Occupancy Progress Bar */}
                    <div className="mt-4 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                        <span className="text-gray-500">سیٹوں کی اوکیوپینسی:</span>
                        <span className="text-emerald-700 font-bold">
                          {booked} / {total} سیٹیں ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1.5 text-[10px] text-gray-400">
                        <span>خالی سیٹیں: {Math.max(0, total - booked)}</span>
                        <span>بک شدہ: {booked}</span>
                      </div>
                    </div>

                  {/* Group Details */}
                  <div className="mt-4 space-y-2 text-xs text-gray-700 border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        تاریخ روانگی:
                      </span>
                      <span className="font-semibold text-gray-900">{formatDate(grp.departure_date)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5" />
                        ایئرلائن:
                      </span>
                      <span className="font-semibold text-gray-900">{grp.airline || 'Scheduled'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        مکہ / مدینہ ہوٹل:
                      </span>
                      <span className="font-semibold text-gray-900 truncate max-w-[140px]">
                        {grp.makkah_hotel || 'Swissotel'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        پیکج فی کس:
                      </span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {formatCurrency(grp.price_per_person)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    href={`/dashboard/groups/${grp.id}`}
                    className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition flex items-center justify-center gap-2 group/btn"
                  >
                    <span>زائرین اور گروپس انتظام کھولیں</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white border border-gray-100 rounded-[28px] p-5 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-bold text-gray-900">+ نیا گروپ بنائیں</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  گروپ کا نام (Group Name)*
                </label>
                <input
                  type="text"
                  required
                  placeholder='e.g. "Umrah Group 15 Dec 2026 - 40 Persons"'
                  value={formData.group_name}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاریخ روانگی</label>
                  <input
                    type="date"
                    required
                    value={formData.departure_date}
                    onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاریخ واپسی</label>
                  <input
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ایئرلائن</label>
                  <input
                    type="text"
                    value={formData.airline}
                    onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                    placeholder="Saudi Airlines / PIA"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کل سیٹیں (Total Seats)</label>
                  <input
                    type="number"
                    value={formData.total_seats}
                    onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">مکہ مکرمہ ہوٹل</label>
                  <input
                    type="text"
                    value={formData.makkah_hotel}
                    onChange={(e) => setFormData({ ...formData, makkah_hotel: e.target.value })}
                    placeholder="Swissotel Makkah"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">مدینہ منورہ ہوٹل</label>
                  <input
                    type="text"
                    value={formData.madina_hotel}
                    onChange={(e) => setFormData({ ...formData, madina_hotel: e.target.value })}
                    placeholder="Anwar Al Madinah"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">پیکج قیمت فی کس (PKR)</label>
                <input
                  type="number"
                  value={formData.price_per_person}
                  onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  {submitting ? 'محفوظ ہو رہا ہے...' : 'گروپ محفوظ کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
