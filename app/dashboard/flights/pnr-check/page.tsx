'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Plane,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Luggage,
  Users,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Calendar,
  History,
  Sparkles,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PnrCheckPage() {
  const { data: historyData, mutate: mutateHistory } = useSWR('/api/flights/check-pnr', fetcher);
  const historyList = historyData?.history || [];

  const [pnr, setPnr] = useState('');
  const [airline, setAirline] = useState('Saudia Airlines');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const airlines = [
    'Saudia Airlines',
    'Pakistan International Airlines (PIA)',
    'Emirates',
    'Airblue',
    'Fly Jinnah',
    'Serene Air',
    'Qatar Airways',
    'Flynas',
    'Gulf Air',
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnr.trim()) {
      setErrorMsg('براہ کرم PNR کوڈ درج کریں');
      return;
    }

    setSearching(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch('/api/flights/check-pnr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnr: pnr.trim(), airline }),
      });

      const resData = await res.json();
      if (res.ok && resData.data) {
        setResult(resData.data);
        mutateHistory();
      } else {
        setErrorMsg(resData.error || 'PNR کی تصدیق نہیں ہو سکی');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'کنکشن میں خرابی پیش آگئی');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden max-w-5xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-4">
      {/* Top Header */}
      <div className="overflow-hidden transform-none" dir="rtl" style={{ transform: 'none' }}>
        <h1 className="font-urdu text-[28px] md:text-[32px] font-bold text-right leading-[2.2] transform-none rotate-0 not-italic text-gray-900" style={{ transform: 'none', fontStyle: 'normal' }}>
          ایئرلائن <span className="font-english">PNR</span> لائیو چیک و اسٹیٹس
        </h1>
        <p className="font-urdu text-sm text-gray-600 text-right transform-none" dir="rtl">
          تمام بڑی ایئرلائنز کی لائیو سیٹ ریزرویشن، فلائٹ وقت اور سامان الاؤنس <span className="font-english text-xs text-sky-600">(PNR Auto Check)</span>
        </p>
      </div>

      {/* PNR Search Card */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-6 overflow-hidden">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* PNR Input */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              PNR کوڈ درج کریں *
            </label>
            <input
              type="text"
              required
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              placeholder="e.g. PK782X یا SV9102"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono font-bold text-gray-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Airline Dropdown */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              ایئرلائن منتخب کریں
            </label>
            <select
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-sky-500"
            >
              {airlines.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-1">
            <button
              type="submit"
              disabled={searching}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-sky-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ایئرلائن ڈیٹا حاصل ہو رہا ہے...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  PNR اسٹیٹس چیک کریں
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Flight Result Card */}
      {result && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center font-bold text-lg">
                <Plane className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs text-sky-300 font-mono block">PNR: {result.pnr}</span>
                <h2 className="text-xl font-black text-white">{result.airline} ({result.flight})</h2>
                <span className="text-xs text-slate-300">{result.sector}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {result.status} (Confirmed)
              </span>
              <span className="block text-[11px] text-slate-400 mt-1">گیٹ: {result.gate} | {result.terminal}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 sm:p-8 pt-0 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Box 1: Timing */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> پرواز کا وقت
              </span>
              <strong className="text-gray-900 text-base block font-mono">
                روانگی: {result.departure_time}
              </strong>
              <span className="text-gray-500 block">پہنچنے کا وقت: {result.arrival_time}</span>
            </div>

            {/* Box 2: Terminal */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> ٹرمینل و ہوائی اڈہ
              </span>
              <strong className="text-gray-900 text-sm block">{result.terminal}</strong>
              <span className="text-gray-500 block">بورڈنگ گیٹ: {result.gate}</span>
            </div>

            {/* Box 3: Baggage */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <Luggage className="w-3.5 h-3.5" /> سامان الاؤنس (Baggage)
              </span>
              <strong className="text-emerald-700 text-sm block">{result.baggage}</strong>
              <span className="text-gray-500 block">زم زم الاؤنس: 5 لیٹر شامل ہے</span>
            </div>
          </div>

          {/* Passengers List on this PNR */}
          <div className="px-6 sm:px-8 pb-8">
            <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              اس PNR پر تصدیق شدہ مسافرین:
            </h3>

            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden text-xs">
              {result.passengers.map((p: any, idx: number) => (
                <div key={idx} className="p-3.5 flex items-center justify-between bg-white hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <strong className="text-gray-900">{p.name}</strong>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Table of Previous PNR Checks */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="font-bold text-sm text-gray-900">حالیہ چیک کیے گئے PNRs (PNR Check History)</h2>
          </div>
          <span className="text-xs text-gray-400">خودکار روزانہ شیڈول مانیٹرنگ فعال ہے</span>
        </div>

        {historyList.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">ابھی تک کوئی PNR چیک نہیں کیا گیا۔</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">PNR</th>
                  <th className="py-2.5 px-3">ایئرلائن</th>
                  <th className="py-2.5 px-3">آخری تصدیق</th>
                  <th className="py-2.5 px-3">اسٹیٹس</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyList.map((h: any) => (
                  <tr key={h.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{h.pnr}</td>
                    <td className="py-2.5 px-3 text-gray-700">{h.airline}</td>
                    <td className="py-2.5 px-3 text-gray-500">{new Date(h.created_at || Date.now()).toLocaleDateString('en-GB')}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        Confirmed ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
