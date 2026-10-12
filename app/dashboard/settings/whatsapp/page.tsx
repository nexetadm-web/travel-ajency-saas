'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAgency } from '@/hooks/useAgency';
import {
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WhatsAppSettingsPage() {
  const { agency } = useAgency();
  const { data: logsData, mutate: mutateLogs, isLoading } = useSWR('/api/whatsapp/logs', fetcher);
  const logs = logsData?.logs || [];

  const [testPhone, setTestPhone] = useState(agency?.phone || '03001234567');
  const [testMessage, setTestMessage] = useState('السلام علیکم! یہ ٹیسٹ میسج ہے ٹریول ایجنسی ساس کلاؤڈ سسٹم سے۔');
  const [sending, setSending] = useState(false);
  const [cronRunning, setCronRunning] = useState(false);
  const [msgResult, setMsgResult] = useState('');

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMsgResult('');

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: testPhone,
          messageType: 'general',
          message: testMessage,
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setMsgResult('پیغام کامیابی سے لاگ اور ارسال کر دیا گیا!');
        mutateLogs();
      }
    } catch (err) {
      setMsgResult('ارسال میں خرابی');
    } finally {
      setSending(false);
    }
  };

  const handleTriggerCron = async () => {
    setCronRunning(true);
    setMsgResult('');

    try {
      const res = await fetch('/api/cron/daily-summary');
      const data = await res.json();
      if (res.ok) {
        setMsgResult('روزانہ سمری کرون جاب اور AI الرٹس کامیابی سے چلا دیے گئے!');
        mutateLogs();
      }
    } catch (err) {
      setMsgResult('کرون چلانے میں خرابی');
    } finally {
      setCronRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">WhatsApp خودکار برانڈنگ اور ٹیمپلیٹس</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              Meta Cloud API
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ویزہ پرنٹ ہونے پر، رسید بننے پر، اور روزانہ رات 9 بجے مالک کو خلاصہ بھیجنے کا خودکار نظام
          </p>
        </div>

        <button
          onClick={handleTriggerCron}
          disabled={cronRunning}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cronRunning ? 'animate-spin' : ''}`} />
          {cronRunning ? 'کرون چل رہا ہے...' : '9PM ڈیلی سمری کرون ٹیسٹ کریں'}
        </button>
      </div>

      {msgResult && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{msgResult}</span>
        </div>
      )}

      {/* AUTOMATION TEMPLATES OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white">1. ویزہ پرنٹ الرٹ</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">فعال</span>
          </div>
          <p className="text-xs text-slate-400">
            جب ویزہ کا سٹیٹس 'printed' پر بدلا جائے گا، زائر کو خودکار مبارکباد کا پیغام اور ایجنسی رابطہ نمبر روانہ ہوگا۔
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white">2. ادائیگی کی رسید اور QR</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">فعال</span>
          </div>
          <p className="text-xs text-slate-400">
            گاہک سے رقم وصول کرنے پر وصول شدہ رقم، بقیہ رقم اور آن لائن QR تصدیقی لنک واٹس ایپ پر جاتا ہے۔
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white">3. ڈیلی 9PM مالک سمری</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">فعال</span>
          </div>
          <p className="text-xs text-slate-400">
            روزانہ رات 9 بجے ایجنسی کے مالک کو کل ٹکٹس، آج کا خالص منافع اور زائرین کا مکمل خلاصہ موصول ہوتا ہے۔
          </p>
        </div>
      </div>

      {/* TEST MESSAGE SENDER */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          براہِ راست واٹس ایپ ٹیسٹ پیغام بھیجیں (Instant WhatsApp Test Dispatch)
        </h3>

        <form onSubmit={handleSendTestMessage} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <input
              type="text"
              required
              placeholder="فون نمبر (مثال: 03001234567)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>
          <div>
            <input
              type="text"
              required
              placeholder="پیغام کا متن..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={sending}
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? 'ارسال ہو رہا ہے...' : 'پیغام بھیجیں'}
            </button>
          </div>
        </form>
      </div>

      {/* WHATSAPP LOGS HISTORY TABLE */}
      <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">واٹس ایپ ترسیل کی تاریخ اور لاگز (Dispatch Logs)</h3>
          <span className="text-xs text-slate-500">{logs.length} پیغامات</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-850 text-slate-500 text-[11px] uppercase">
              <tr>
                <th className="pb-3">وصول کنندہ فون</th>
                <th className="pb-3">قسم (Type)</th>
                <th className="pb-3">پیغام کا متن</th>
                <th className="pb-3">سٹیٹس</th>
                <th className="pb-3">وقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="py-3 font-mono font-bold text-sky-400">{log.recipient_phone}</td>
                  <td className="py-3 capitalize text-slate-300">{log.message_type}</td>
                  <td className="py-3 max-w-xs truncate text-slate-400">{log.message}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 text-[10px]">{formatDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-8">کوئی لاگ موجود نہیں ہے</p>
          )}
        </div>
      </div>
    </div>
  );
}
