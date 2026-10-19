'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Plane,
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TicketsPage() {
  const [search, setSearch] = useState('');
  const { data, mutate, isLoading } = useSWR(`/api/tickets?q=${encodeURIComponent(search)}`, fetcher, {
    dedupingInterval: 3000,
  });

  const { data: pilgrimsData } = useSWR('/api/pilgrims', fetcher);
  const pilgrims = pilgrimsData?.pilgrims || [];

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    pnr: '',
    airline: 'Saudi Airlines',
    sector: 'LHE-JED-LHE',
    passenger_name: '',
    passport_no: '',
    purchase_rate: '80000',
    sale_rate: '85000',
    travel_date: '',
    return_date: '',
    status: 'booked',
  });

  const tickets = data?.tickets || [];
  const stats = data?.stats || { todayCount: 0, monthProfit: 0, totalTickets: 0 };
  const airlineChartData = data?.airlineChartData || [];

  const liveProfit = (parseFloat(formData.sale_rate) || 0) - (parseFloat(formData.purchase_rate) || 0);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || 'ٹکٹ محفوظ کرنے میں خرابی');
        setSubmitting(false);
        return;
      }

      mutate();
      setShowModal(false);
      setFormData({
        pnr: '',
        airline: 'Saudi Airlines',
        sector: 'LHE-JED-LHE',
        passenger_name: '',
        passport_no: '',
        purchase_rate: '80000',
        sale_rate: '85000',
        travel_date: '',
        return_date: '',
        status: 'booked',
      });
    } catch (err: any) {
      setErrorMsg('نیٹ ورک کی خرابی: دوبارہ کوشش کریں');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPilgrim = (passport: string) => {
    const matched = pilgrims.find((p: any) => p.passport_no.toUpperCase() === passport.toUpperCase());
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        passport_no: matched.passport_no,
        passenger_name: matched.full_name,
      }));
    } else {
      setFormData((prev) => ({ ...prev, passport_no: passport }));
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-urdu text-[20px] sm:text-[26px] md:text-[32px] font-bold leading-[1.4] break-words text-gray-900">ٹکٹنگ اور PNR مینجمنٹ</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200 shrink-0">
              کل ٹکٹس: {stats.totalTickets}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 break-words leading-relaxed">
            انسٹنٹ PNR سرچ، آٹو منافع، زائرین کے ساتھ پاسپورٹ لنکنگ اور ایئرلائن اینالیٹکس
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 shrink-0" />
          + نئی ٹکٹ (New Ticket)
        </button>
      </div>

      {/* TOP CARDS: TODAY TICKETS & MONTH PROFIT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-[20px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase">آج کی ٹکٹس (Today Tickets)</span>
            <div className="text-3xl font-black text-gray-900 mt-1">{stats.todayCount}</div>
            <span className="text-[11px] text-sky-600 font-medium mt-1 block">آج جاری کردہ پی این آر</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Plane className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-[20px] bg-white border-2 border-emerald-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase">ماہانہ خالص منافع (Month Profit)</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">
              {formatCurrency(stats.monthProfit)}
            </div>
            <span className="text-[11px] text-emerald-700 mt-1 block font-medium">ٹکٹنگ سے خالص کمائی</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-[20px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase">کل بک شدہ ٹکٹس (Total PNRs)</span>
            <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalTickets}</div>
            <span className="text-[11px] text-purple-600 font-medium mt-1 block">لائیو ڈیٹا بیس ریکارڈ</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AIRLINE PROFIT CHART */}
      {airlineChartData.length > 0 && (
        <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <h3 className="font-bold text-sm text-gray-900">ایئرلائن وائز منافع چارٹ (Airline Profit Report)</h3>
            </div>
            <span className="text-xs text-gray-400">ریئل ٹائم Turso Drizzle تجزیہ</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={airlineChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="airline" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₨${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₨ ${Number(value).toLocaleString()}`, 'منافع']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Bar dataKey="profit" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SEARCH AND TICKETS TABLE */}
      <div className="space-y-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="PNR، مسافر نام یا پاسپورٹ سرچ کریں (<200ms)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-500 shadow-sm"
          />
        </div>

        <div className="rounded-[24px] border border-gray-100 bg-white overflow-x-auto shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px] border-b border-gray-100">
              <tr>
                <th className="p-4">PNR</th>
                <th className="p-4">مسافر کا نام</th>
                <th className="p-4">ایئرلائن</th>
                <th className="p-4">سیکٹر</th>
                <th className="p-4">پاسپورٹ</th>
                <th className="p-4">خرید ریٹ</th>
                <th className="p-4">فروخت ریٹ</th>
                <th className="p-4">منافع (Profit)</th>
                <th className="p-4">سفر تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-400">
                    ٹکٹس لوڈ ہو رہی ہیں...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-400">
                    کوئی ٹکٹ ریکارڈ نہیں ملا۔
                  </td>
                </tr>
              ) : (
                tickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4 font-mono font-black text-sky-600 text-sm">{t.pnr}</td>
                    <td className="p-4 font-bold text-gray-900">{t.passenger_name}</td>
                    <td className="p-4 font-semibold text-gray-800">{t.airline}</td>
                    <td className="p-4 font-mono text-gray-500">{t.sector}</td>
                    <td className="p-4 font-mono text-emerald-700 font-bold">{t.passport_no || '-'}</td>
                    <td className="p-4 text-gray-500">{formatCurrency(t.purchase_rate)}</td>
                    <td className="p-4 font-bold text-gray-900">{formatCurrency(t.sale_rate)}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                        +{formatCurrency(t.profit)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{formatDate(t.travel_date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-bold text-gray-900">+ نئی ٹکٹ بکنگ (New PNR)</h3>
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

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PNR کوڈ *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC123"
                    value={formData.pnr}
                    onChange={(e) => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-mono uppercase font-black focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ایئرلائن *</label>
                  <input
                    type="text"
                    required
                    placeholder="Saudi Airlines"
                    value={formData.airline}
                    onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">سیکٹر (Sector)*</label>
                <input
                  type="text"
                  required
                  placeholder="LHE-JED-LHE"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-mono uppercase focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">پاسپورٹ (Select or Type)</label>
                  <input
                    type="text"
                    placeholder="AK1234567"
                    value={formData.passport_no}
                    onChange={(e) => handleSelectPilgrim(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-mono uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">مسافر کا نام *</label>
                  <input
                    type="text"
                    required
                    placeholder="محمد علی"
                    value={formData.passenger_name}
                    onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">خرید ریٹ (Purchase Rate)</label>
                  <input
                    type="number"
                    required
                    value={formData.purchase_rate}
                    onChange={(e) => setFormData({ ...formData, purchase_rate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">فروخت ریٹ (Sale Rate)</label>
                  <input
                    type="number"
                    required
                    value={formData.sale_rate}
                    onChange={(e) => setFormData({ ...formData, sale_rate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Live Profit Preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-bold">خودکار منافع کا حساب (Auto Profit):</span>
                <span className="font-black text-sm text-emerald-700">
                  {formatCurrency(liveProfit)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">سفر تاریخ</label>
                  <input
                    type="date"
                    value={formData.travel_date}
                    onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">واپسی تاریخ</label>
                  <input
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs"
                  />
                </div>
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
                  {submitting ? 'محفوظ ہو رہا ہے...' : 'ٹکٹ محفوظ کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
