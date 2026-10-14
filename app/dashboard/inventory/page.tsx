'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Package,
  Plus,
  Boxes,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Tag,
  ArrowUpDown,
  History,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import PremiumCard from '@/components/ui/premium-card';
import ContentCard from '@/components/ui/content-card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ITEM_PRESETS = [
  'عمرہ بیگ (Umrah Bag)',
  'احرام مردانہ (Men Ihram)',
  'احرام خواتین (Women Abaya / Hijab)',
  'حج و عمرہ دعا کتاب (Dua Book)',
  'شناختی کارڈ و رسی کارڈ (ID Card Tag)',
  'احرام بیلٹ (Ihram Belt)',
  'جوتا بیگ (Shoes Bag)',
  'طواف تسبیح و کاؤنٹر (Tasbeeh Counter)',
];

export default function InventoryPage() {
  const { data: itemsData, mutate: mutateItems, isLoading: loadingItems } = useSWR(
    '/api/inventory',
    fetcher
  );
  const { data: issuesData, mutate: mutateIssues, isLoading: loadingIssues } = useSWR(
    '/api/inventory/issue',
    fetcher
  );

  const items = itemsData?.items || [];
  const issues = issuesData?.issues || [];

  const [activeTab, setActiveTab] = useState<'items' | 'history'>('items');
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [stockChange, setStockChange] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    itemName: '',
    purchasePrice: '',
    stockQty: '50',
  });

  const totalStock = items.reduce((sum: number, it: any) => sum + (it.stockQty || 0), 0);
  const totalIssued = items.reduce((sum: number, it: any) => sum + (it.issuedQty || 0), 0);
  const totalValue = items.reduce(
    (sum: number, it: any) => sum + (it.stockQty || 0) * (it.purchasePrice || 0),
    0
  );

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName) {
      setErrorMsg('سامان کا نام درج کریں');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'محفوظ کرنے میں خرابی');
      }

      setModalOpen(false);
      setForm({ itemName: '', purchasePrice: '', stockQty: '50' });
      mutateItems();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustStock = async (itemId: string, addQty: number) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, addQty }),
      });
      if (res.ok) {
        mutateItems();
      }
    } catch (err) {
      console.error('Stock adjust error', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-md">
              🧳
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">حج و عمرہ کٹ اور سامان انوینٹری</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                بیگ، احرام، دعائیہ کتب اور شناختی کارڈز کا مکمل سٹاک و تقسیم ٹریکر
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setErrorMsg('');
            setModalOpen(true);
          }}
          className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          + نیا سامان شامل کریں
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard
          title="سامان کی اقسام"
          value={items.length}
          subtitle="رجسٹرڈ انوینٹری آئٹمز"
          icon={Boxes}
          gradient="violet"
          trend="آئٹمز"
        />
        <PremiumCard
          title="دستیاب سٹاک (موجود)"
          value={totalStock}
          subtitle="سٹور میں موجود پیس"
          icon={Package}
          gradient="emerald"
          trend="سٹاک"
        />
        <PremiumCard
          title="تقسیم شدہ کٹس"
          value={totalIssued}
          subtitle="حجاج کو دیے گئے کٹس"
          icon={CheckCircle2}
          gradient="cyan"
          trend="ایشوڈ"
        />
        <PremiumCard
          title="سٹاک کی تخمینہ قیمت"
          value={formatCurrency(totalValue)}
          subtitle="موجودہ انوینٹری مالیت"
          icon={DollarSign}
          gradient="rose"
          trend="مالیت"
        />
      </div>

      {/* TABS */}
      <div className="flex items-center gap-3 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'items'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>موجودہ انوینٹری لسٹ ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-2 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>حالیہ کٹ تقسیم لاگ ({issues.length})</span>
        </button>
      </div>

      {/* TAB 1: ITEMS */}
      {activeTab === 'items' && (
        <div className="rounded-[24px] border border-gray-100 bg-white overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          {loadingItems ? (
            <div className="py-20 text-center text-gray-400">
              <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2 text-emerald-500" />
              <p className="text-xs">سامان لوڈ ہو رہا ہے...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
              <p className="text-sm font-bold text-gray-700">کوئی سامان رجسٹر نہیں ہے</p>
              <p className="text-xs text-gray-400 mt-1">
                اوپر بٹن پر کلک کر کے بیگ، احرام یا کتب کا سٹاک شامل کریں
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">سامان کا نام</th>
                    <th className="p-4 text-center">خرید قیمت</th>
                    <th className="p-4 text-center">موجودہ سٹاک</th>
                    <th className="p-4 text-center">تقسیم شدہ</th>
                    <th className="p-4 text-center">سٹاک کی حالت</th>
                    <th className="p-4 text-center">سٹاک ایڈجسٹمنٹ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((it: any) => (
                    <tr key={it.id} className="hover:bg-emerald-50/20 transition">
                      <td className="p-4 font-bold text-gray-900 text-sm">{it.itemName}</td>
                      <td className="p-4 text-center text-gray-600 font-semibold">
                        {it.purchasePrice ? formatCurrency(it.purchasePrice) : '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full font-black text-sm ${
                            it.stockQty <= 5
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {it.stockQty} پیس
                        </span>
                      </td>
                      <td className="p-4 text-center text-gray-500 font-bold">
                        {it.issuedQty || 0} پیس
                      </td>
                      <td className="p-4 text-center">
                        {it.stockQty === 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            آؤٹ آف سٹاک ⚠️
                          </span>
                        ) : it.stockQty <= 10 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                            کم سٹاک
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            دستیاب ہے ✅
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(it.id, 10)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition"
                            title="10 شامل کریں"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleAdjustStock(it.id, 1)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition"
                            title="1 شامل کریں"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleAdjustStock(it.id, -1)}
                            disabled={it.stockQty <= 0}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] border border-rose-200 transition disabled:opacity-40"
                            title="1 کم کریں"
                          >
                            -1
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ISSUES HISTORY */}
      {activeTab === 'history' && (
        <div className="rounded-[24px] border border-gray-100 bg-white overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          {loadingIssues ? (
            <div className="py-20 text-center text-gray-400">
              <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2 text-indigo-500" />
              <p className="text-xs">ہسٹری لوڈ ہو رہی ہے...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
              <p className="text-sm font-bold text-gray-700">کوئی کٹ تقسیم ریکارڈ نہیں ہے</p>
              <p className="text-xs text-gray-400 mt-1">
                کسی گروپ کے اندر &quot;کٹ تقسیم&quot; ٹیب سے حجاج کو سامان جاری کریں
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">حاجی کا نام</th>
                    <th className="p-4">پاسپورٹ نمبر</th>
                    <th className="p-4">سامان کی تفصیل</th>
                    <th className="p-4">تاریخ اجرا</th>
                    <th className="p-4 text-center">سٹیٹس</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {issues.map((iss: any) => (
                    <tr key={iss.id} className="hover:bg-indigo-50/20 transition">
                      <td className="p-4 font-bold text-gray-900">{iss.pilgrimName || '-'}</td>
                      <td className="p-4 font-mono font-bold text-emerald-700">
                        {iss.passportNo || '-'}
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                          {iss.itemName || 'عمرہ کٹ'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-[11px]">
                        {iss.issuedDate || '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          جاری شدہ (Issued)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE ITEM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  🧳
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">نیا سامان شامل کریں</h3>
                  <p className="text-[11px] text-gray-500">حج و عمرہ کٹ، احرام، دعائیہ کتب وغیرہ</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
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

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  سامان کا نام *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. احرام مردانہ یا عمرہ بیگ"
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* QUICK PRESETS */}
              <div>
                <span className="text-[11px] text-gray-400 block mb-1.5 font-bold">
                  تجویز کردہ آئٹمز پر کلک کریں:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ITEM_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setForm({ ...form, itemName: preset })}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 text-[11px] font-semibold transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    خرید قیمت فی پیس (اختیاری)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1200"
                    value={form.purchasePrice}
                    onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ابتدائی سٹاک کی تعداد *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stockQty}
                    onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-200 transition flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>سٹاک میں محفوظ کریں</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
