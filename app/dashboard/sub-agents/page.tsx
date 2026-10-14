'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import {
  Users2,
  UserPlus,
  DollarSign,
  TrendingUp,
  CreditCard,
  Phone,
  MapPin,
  ChevronRight,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import PremiumCard from '@/components/ui/premium-card';
import ContentCard from '@/components/ui/content-card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SubAgentsPage() {
  const { data, mutate, isLoading } = useSWR('/api/sub-agents', fetcher);
  const subAgents = data?.subAgents || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    cnic: '',
    city: '',
    commissionType: 'per_person',
    commissionValue: '5000',
  });

  const totalPilgrims = subAgents.reduce((sum: number, a: any) => sum + (a.totalPilgrims || 0), 0);
  const totalEarned = subAgents.reduce((sum: number, a: any) => sum + (a.totalEarned || 0), 0);
  const totalPaid = subAgents.reduce((sum: number, a: any) => sum + (a.totalPaid || 0), 0);
  const totalRemaining = subAgents.reduce((sum: number, a: any) => sum + (a.remaining || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      setErrorMsg('براہ کرم سب ایجنٹ کا نام اور فون نمبر درج کریں');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/sub-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'سب ایجنٹ محفوظ کرنے میں خرابی');
      }

      setModalOpen(false);
      setForm({
        name: '',
        phone: '',
        cnic: '',
        city: '',
        commissionType: 'per_person',
        commissionValue: '5000',
      });
      mutate();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-md">
              👥
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">سب ایجنٹس اور ریفرل پارٹنرز</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                مقامی ایجنٹس، کمیشن مینجمنٹ، حجاج ٹریکنگ اور خودکار ادائیگی سسٹم
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
          <UserPlus className="w-4 h-4" />
          + نیا سب ایجنٹ شامل کریں
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard
          title="کل سب ایجنٹس"
          value={subAgents.length}
          subtitle="ایکٹو پارٹنرز و ریفرلز"
          icon={Users2}
          gradient="violet"
          trend="پارٹنرز"
        />
        <PremiumCard
          title="کل ریفر کردہ حجاج"
          value={totalPilgrims}
          subtitle="کامیاب بکنگز و ویزے"
          icon={TrendingUp}
          gradient="cyan"
          trend="حجاج تعداد"
        />
        <PremiumCard
          title="کل کمیشن بن چکا"
          value={formatCurrency(totalEarned)}
          subtitle="مجموعی ارننگ"
          icon={DollarSign}
          gradient="emerald"
          trend="کمیشن"
        />
        <PremiumCard
          title="باقی واجب الادا کمیشن"
          value={formatCurrency(totalRemaining)}
          subtitle="ادائیگی کے منتظر"
          icon={CreditCard}
          gradient="rose"
          trend="بقایا جات"
        />
      </div>

      {/* SUB AGENTS TABLE */}
      {isLoading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-7 h-7 mx-auto animate-spin mb-2 text-indigo-500" />
          <p className="text-xs">سب ایجنٹس ڈیٹا لوڈ ہو رہا ہے...</p>
        </div>
      ) : subAgents.length === 0 ? (
        <div className="p-12 text-center rounded-[24px] bg-white border border-gray-100 text-gray-400 shadow-sm">
          <Users2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
          <p className="text-sm font-bold text-gray-700">کوئی سب ایجنٹ شامل نہیں ہے</p>
          <p className="text-xs text-gray-400 mt-1">
            اوپر دیے گئے بٹن پر کلک کر کے نیا سب ایجنٹ رجسٹر کریں
          </p>
        </div>
      ) : (
        <ContentCard>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">سب ایجنٹ نام</th>
                  <th className="p-4">فون و شہر</th>
                  <th className="p-4">شناختی کارڈ</th>
                  <th className="p-4">کمیشن ریٹ</th>
                  <th className="p-4 text-center">ریفر کردہ حجاج</th>
                  <th className="p-4">کل کمیشن</th>
                  <th className="p-4">ادا شدہ</th>
                  <th className="p-4">باقی رقم</th>
                  <th className="p-4 text-center">تفصیلات و کھاتہ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subAgents.map((agent: any) => (
                  <tr key={agent.id} className="hover:bg-indigo-50/20 transition">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 text-sm">{agent.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-gray-800 font-mono">
                        <Phone className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{agent.phone}</span>
                      </div>
                      {agent.city && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{agent.city}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono text-gray-500">{agent.cnic || '-'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {agent.commissionType === 'percent' ||
                        agent.commission_type === 'percent' ||
                        agent.commission_type === 'percentage'
                          ? `${agent.commissionValue ?? agent.commission_value}% فی بکنگ`
                          : `Rs. ${Number(agent.commissionValue ?? agent.commission_value ?? agent.commission_per_haji ?? 0).toLocaleString()} فی حاجی`}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {agent.totalPilgrims || 0}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      {formatCurrency(agent.totalEarned || 0)}
                    </td>
                    <td className="p-4 font-semibold text-emerald-600">
                      {formatCurrency(agent.totalPaid || 0)}
                    </td>
                    <td className="p-4 font-black text-rose-600">
                      {formatCurrency(agent.remaining || 0)}
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/dashboard/sub-agents/${agent.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] border border-indigo-200 transition"
                      >
                        <span>کھاتہ اور حجاج</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>
      )}

      {/* ADD SUB AGENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  👥
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">نیا سب ایجنٹ رجسٹر کریں</h3>
                  <p className="text-[11px] text-gray-500">کمیشن کا ریٹ اور رابطہ نمبر درج کریں</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ایجنٹ کا مکمل نام *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. محمد سلیم (گوجرانوالہ ایجنٹ)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    موبائل / واٹس ایپ نمبر *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    شہر / علاقہ
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. لاہور / سیالکوٹ"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  شناختی کارڈ (CNIC) اختیاری
                </label>
                <input
                  type="text"
                  placeholder="35201-xxxxxxx-x"
                  value={form.cnic}
                  onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    کمیشن کی قسم
                  </label>
                  <select
                    value={form.commissionType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        commissionType: e.target.value,
                        commissionValue: e.target.value === 'percent' ? '5' : '5000',
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="per_person">مقررہ رقم فی حاجی (Per Pilgrim)</option>
                    <option value="percent">فیصد تناسب (Percentage %)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {form.commissionType === 'percent' ? 'کمیشن فیصد (%)' : 'کمیشن رقم (روپے)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.commissionValue}
                    onChange={(e) => setForm({ ...form, commissionValue: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500 font-bold"
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
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-200 transition flex items-center gap-2"
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
