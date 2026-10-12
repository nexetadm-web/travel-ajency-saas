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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">ٹکٹنگ اور PNR مینجمنٹ</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold">
              ماڈیول 2
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            انسٹنٹ PNR سرچ، آٹو منافع، زائرین کے ساتھ پاسپورٹ لنکنگ اور ایئرلائن اینالیٹکس
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          + نئی ٹکٹ (New Ticket)
        </button>
      </div>

      {/* TOP CARDS: TODAY TICKETS & MONTH PROFIT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">آج کی ٹکٹس (Today Tickets)</span>
            <div className="text-3xl font-black text-white mt-1">{stats.todayCount}</div>
            <span className="text-[11px] text-sky-400 font-medium">آج جاری کردہ پی این آر</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Plane className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950/80 border border-emerald-500/30 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-medium">ماہانہ خالص منافع (Month Profit)</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {formatCurrency(stats.monthProfit)}
            </div>
            <span className="text-[11px] text-emerald-300/70 font-medium">ٹکٹنگ سے خالص کمائی</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">کل بک شدہ ٹکٹس (Total PNRs)</span>
            <div className="text-3xl font-black text-white mt-1">{stats.totalTickets}</div>
            <span className="text-[11px] text-indigo-400 font-medium">تمام ایئرلائنز</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AIRLINE PROFIT CHART */}
      {airlineChartData.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            ایئرلائن وائز منافع اینالیٹکس (Profit Per Airline Chart)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={airlineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="airline" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="profit" name="خالص منافع (PKR)" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TABLE PNR INSTANT SEARCH */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="PNR، مسافر، پاسپورٹ یا ایئرلائن تلاش کریں..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <span className="text-xs text-slate-400 font-medium">
            تعداد: <strong>{tickets.length} ٹکٹس</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
            <p className="text-xs">ٹکٹس لوڈ ہو رہی ہیں...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400">
            <Plane className="w-10 h-10 mx-auto mb-2 opacity-30 text-sky-400" />
            <p className="text-sm font-semibold">کوئی ٹکٹ نہیں ملی</p>
            <p className="text-xs text-slate-500 mt-1">اوپر دیے گئے بٹن پر کلک کر کے نئی ٹکٹ ریکارڈ کریں۔</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">PNR کوڈ</th>
                  <th className="p-3.5">مسافر کا نام</th>
                  <th className="p-3.5">ایئرلائن اور سیکٹر</th>
                  <th className="p-3.5">خریداری ریٹ</th>
                  <th className="p-3.5">فروخت ریٹ</th>
                  <th className="p-3.5">خالص منافع (Auto)</th>
                  <th className="p-3.5">تاریخ سفر</th>
                  <th className="p-3.5">سٹیٹس</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {tickets.map((t: any) => {
                  const profit = (t.sale_rate || 0) - (t.purchase_rate || 0);
                  return (
                    <tr key={t.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-3.5 font-mono font-black text-sky-400 tracking-wider">
                        {t.pnr}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-white block">{t.passenger_name}</span>
                        {t.passport_no && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            پاسپورٹ: {t.passport_no}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="block text-slate-200 font-medium">{t.airline}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{t.sector}</span>
                      </td>
                      <td className="p-3.5 text-slate-400">PKR {(t.purchase_rate || 0).toLocaleString()}</td>
                      <td className="p-3.5 font-semibold text-white">PKR {(t.sale_rate || 0).toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className={`font-black ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {profit >= 0 ? '+' : ''}PKR {profit.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{formatDate(t.travel_date)}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: + نئی ٹکٹ */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">+ نئی ٹکٹ جاری کریں</h3>
                  <p className="text-xs text-slate-400">PNR اور قیمت درج کر کے منافع خودکار حاصل کریں</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">PNR کوڈ*</label>
                  <input
                    type="text"
                    required
                    placeholder="ABC123"
                    value={formData.pnr}
                    onChange={(e) => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ایئرلائن*</label>
                  <input
                    type="text"
                    required
                    placeholder="Saudi Airlines / PIA"
                    value={formData.airline}
                    onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">سیکٹر (Sector)*</label>
                <input
                  type="text"
                  required
                  placeholder="LHE-JED-LHE"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">مسافر کا نام*</label>
                  <input
                    type="text"
                    required
                    placeholder="محمد علی"
                    value={formData.passenger_name}
                    onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">پاسپورٹ نمبر (اختیاری)</label>
                  <input
                    type="text"
                    placeholder="AK1234567"
                    value={formData.passport_no}
                    onChange={(e) => handleSelectPilgrim(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">خریداری ریٹ (Purchase)</label>
                  <input
                    type="number"
                    value={formData.purchase_rate}
                    onChange={(e) => setFormData({ ...formData, purchase_rate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">فروخت ریٹ (Sale)</label>
                  <input
                    type="number"
                    value={formData.sale_rate}
                    onChange={(e) => setFormData({ ...formData, sale_rate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* LIVE PROFIT DISPLAY */}
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-400">خودکار متوقع منافع:</span>
                <span className={`font-bold text-sm ${liveProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {liveProfit >= 0 ? '+' : ''}PKR {liveProfit.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">تاریخ سفر (Travel Date)</label>
                  <input
                    type="date"
                    value={formData.travel_date}
                    onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">تاریخ واپسی (Return Date)</label>
                  <input
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/20"
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
