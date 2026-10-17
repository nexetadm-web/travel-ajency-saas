'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileText,
  FileSpreadsheet,
  Plane,
  Building2,
  ArrowRight,
  Download,
  Loader2,
  Sparkles,
  Users,
  CheckCircle2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GroupDocumentsPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const { data: groupData } = useSWR(`/api/groups/${groupId}`, fetcher);
  const { data: pilgrimsData } = useSWR(`/api/pilgrims?groupId=${groupId}`, fetcher);

  const group = groupData?.group;
  const pilgrims = pilgrimsData?.pilgrims || [];

  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const handleDownload = async (docType: string, filename: string) => {
    setDownloadingType(docType);
    try {
      const res = await fetch(`/api/groups/${groupId}/documents?type=${docType}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('دستاویز ڈاؤن لوڈ کرنے میں خرابی پیش آگئی: ' + err.message);
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/groups/${groupId}`}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
                <FileText className="w-5 h-5" />
              </span>
              <span>گروپ دستاویزات و پی ڈی ایف سینٹر (Documents Center)</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              گروپ: <strong className="text-gray-800">{group?.group_name || 'لوڈ ہو رہا ہے...'}</strong> | کل مسافر:{' '}
              <strong className="text-gray-800">{pilgrims.length}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          سرکاری ایجنسی لیٹرہیڈ و برانڈنگ
        </div>
      </div>

      {/* 4 BEAUTIFUL GRADIENT BUTTON CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Card 1: Embassy Manifest PDF */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-xl transition flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">1. ایمبیسی مینی فسٹ پی ڈی ایف (Embassy PDF)</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                تمام زائرین کے نام، پاسپورٹ نمبر، والد کا نام اور تاریخ تنسیخ کا جدول۔ سعودی سفارت خانہ اور وزارت حج کے لیے سرکاری دستاویز۔
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload('embassy-pdf', `embassy-manifest-${groupId}.pdf`)}
            disabled={downloadingType === 'embassy-pdf'}
            className="w-full py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {downloadingType === 'embassy-pdf' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                پی ڈی ایف جنریٹ ہو رہا ہے...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                ایمبیسی لسٹ ڈاؤن لوڈ کریں (PDF)
              </>
            )}
          </button>
        </div>

        {/* Card 2: Embassy Excel Export */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-xl transition flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">2. ایمبیسی ایکسل شیٹ (Embassy Excel)</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                مکمل مسافر ڈیٹا (.CSV / .XLSX فارمیٹ میں)۔ سفارت خانے کے پورٹل پر بلک اپلوڈ اور ایجنسی ریکارڈ کے لیے موزوں۔
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload('embassy-excel', `embassy-manifest-${groupId}.csv`)}
            disabled={downloadingType === 'embassy-excel'}
            className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {downloadingType === 'embassy-excel' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                ایکسل شیٹ تیار ہو رہی ہے...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                ایکسل شیٹ ڈاؤن لوڈ کریں (Excel/CSV)
              </>
            )}
          </button>
        </div>

        {/* Card 3: Bulk E-Tickets */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-xl transition flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-orange-200">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">3. بلک ای-ٹکٹس (E-Tickets Bulk)</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                تمام مسافروں کے ایئرلائن اسٹائل بورڈنگ پاسز مع PNR، بار کوڈ، فلائٹ شیڈول اور بیگج پالیسی۔ ہر صفحے پر الگ مسافر۔
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload('bulk-tickets', `bulk-tickets-${groupId}.pdf`)}
            disabled={downloadingType === 'bulk-tickets'}
            className="w-full py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-orange-200 transition flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {downloadingType === 'bulk-tickets' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                ٹکٹس بن رہی ہیں...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                بلک ای-ٹکٹس ڈاؤن لوڈ کریں (PDF)
              </>
            )}
          </button>
        </div>

        {/* Card 4: Hotel Vouchers */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-xl transition flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-teal-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">4. ہوٹل واؤچرز (Hotel Vouchers)</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                مکہ مکرمہ اور مدینہ منورہ کے 2 واؤچرز فی صفحہ مع ہوٹل کا نام، چیک اِن و آؤٹ تاریخ اور روم کیٹیگری۔
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload('hotel-vouchers', `hotel-vouchers-${groupId}.pdf`)}
            disabled={downloadingType === 'hotel-vouchers'}
            className="w-full py-3 rounded-full bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white font-bold text-xs shadow-lg shadow-teal-200 transition flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {downloadingType === 'hotel-vouchers' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                واؤچرز جنریٹ ہو رہے ہیں...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                ہوٹل واؤچرز ڈاؤن لوڈ کریں (PDF)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Group Pilgrims Preview Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            اس گروپ کے شامل مسافر ({pilgrims.length})
          </h2>
          <span className="text-xs text-gray-400">دستاویز میں خودکار شامل ہوں گے</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">مسافر کا نام</th>
                <th className="py-2.5 px-3">پاسپورٹ نمبر</th>
                <th className="py-2.5 px-3">والد کا نام</th>
                <th className="py-2.5 px-3">ویزا سٹیٹس</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pilgrims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    اس گروپ میں ابھی تک کوئی مسافر شامل نہیں ہے۔
                  </td>
                </tr>
              ) : (
                pilgrims.map((p: any, idx: number) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-mono text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">{p.full_name}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-700">{p.passport_no}</td>
                    <td className="py-2.5 px-3 text-gray-600">{p.father_name || '-'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        {p.visa_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
