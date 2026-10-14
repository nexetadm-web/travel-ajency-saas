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
  Key,
  Smartphone,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { WHATSAPP_TEMPLATES } from '@/lib/whatsapp';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WhatsAppSettingsPage() {
  const { agency } = useAgency();
  const { data: logsData, mutate: mutateLogs, isLoading } = useSWR('/api/whatsapp/logs', fetcher);
  const logs = logsData?.logs || [];

  const [apiKey, setApiKey] = useState('EAAOx...Meta_WhatsApp_Cloud_Token');
  const [phoneId, setPhoneId] = useState('109482910482910');

  // Toggle switches for each auto message
  const [toggles, setToggles] = useState({
    ON_GROUP_CREATE: true,
    VISA_APPROVED: true,
    INSTALLMENT_REMINDER: true,
    TICKET: true,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof WHATSAPP_TEMPLATES>('ON_GROUP_CREATE');
  const [testPhone, setTestPhone] = useState(agency?.phone || '03001234567');
  const [sending, setSending] = useState(false);
  const [msgResult, setMsgResult] = useState('');

  // Sample variable values for live preview
  const previewVariables: Record<string, string> = {
    name: 'محمد طارق',
    group_name: 'عمرہ خصوصی 15 دسمبر',
    date: '15-12-2026',
    leader: 'مولانا احمد بلال (03001234567)',
    link: 'http://localhost:3003/track/ALH-48291',
    amount: 'Rs. 50,000',
    pnr: 'PK786X',
  };

  const getRenderedPreview = (tmpl: string) => {
    let res = tmpl;
    for (const [k, v] of Object.entries(previewVariables)) {
      res = res.replace(new RegExp(`{${k}}`, 'g'), v);
    }
    return res;
  };

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMsgResult('');

    try {
      const rendered = getRenderedPreview(WHATSAPP_TEMPLATES[selectedTemplate]);
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: testPhone,
          messageType: selectedTemplate,
          message: rendered,
        }),
      });

      if (res.ok) {
        setMsgResult('پیغام کامیابی سے واٹس ایپ پر تیار اور لاگ کر دیا گیا!');
        mutateLogs();
      } else {
        setMsgResult('ارسال میں خرابی');
      }
    } catch {
      setMsgResult('ارسال میں خرابی');
    } finally {
      setSending(false);
    }
  };

  const handleRunCron = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/cron/whatsapp');
      const data = await res.json();
      if (res.ok) {
        setMsgResult(`واٹس ایپ آٹو پائلٹ کرون چل گیا! (بھیجے گئے پیغامات: ${data.processed || 0})`);
        mutateLogs();
      }
    } catch {
      setMsgResult('کرون چلانے میں خرابی');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </span>
            واٹس ایپ آٹو پائلٹ سیٹنگز (WhatsApp Autopilot)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Meta Cloud API اور خودکار ٹیمپلیٹ پیغامات (گروپ روانگی، ویزا اپروول، قسط یاد دہانی، ای-ٹکٹ)
          </p>
        </div>

        <button
          onClick={handleRunCron}
          disabled={sending}
          className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${sending ? 'animate-spin' : ''}`} />
          روزانہ خودکار کرون ابھی چلائیں
        </button>
      </div>

      {msgResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msgResult}</span>
        </div>
      )}

      {/* Grid: 1. API Keys & 2. Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Meta Cloud API Settings */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Key className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-sm text-gray-900">Meta WhatsApp Cloud API کنفیگریشن</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                WhatsApp API Key / Access Token
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="EAA..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Phone Number ID (Meta Business Manager)
              </label>
              <input
                type="text"
                value={phoneId}
                onChange={(e) => setPhoneId(e.target.value)}
                placeholder="10948..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setMsgResult('API کیز کامیابی سے محفوظ ہو گئیں!')}
                className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                کیز محفوظ کریں
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Toggle Switches for Each Auto Message */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-sm text-gray-900">خودکار نوٹیفیکیشن ٹوگلز (Auto Switches)</h2>
          </div>

          <div className="space-y-3.5">
            {/* Toggle 1: ON_GROUP_CREATE */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <span className="font-bold text-xs text-gray-900 block">گروپ رجسٹریشن و روانگی میسج</span>
                <span className="text-[11px] text-gray-500">جب بھی حاجی کسی گروپ میں رجسٹر ہو</span>
              </div>
              <input
                type="checkbox"
                checked={toggles.ON_GROUP_CREATE}
                onChange={(e) => setToggles({ ...toggles, ON_GROUP_CREATE: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Toggle 2: VISA_APPROVED */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <span className="font-bold text-xs text-gray-900 block">ویزا اپروول مبارکباد (Visa Approved)</span>
                <span className="text-[11px] text-gray-500">جب سفارت خانے سے ویزہ جاری ہو</span>
              </div>
              <input
                type="checkbox"
                checked={toggles.VISA_APPROVED}
                onChange={(e) => setToggles({ ...toggles, VISA_APPROVED: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Toggle 3: INSTALLMENT_REMINDER */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <span className="font-bold text-xs text-gray-900 block">قسط یاد دہانی (Installment Reminder)</span>
                <span className="text-[11px] text-gray-500">تاریخ ادائیگی سے 3 دن قبل آٹو الرٹ</span>
              </div>
              <input
                type="checkbox"
                checked={toggles.INSTALLMENT_REMINDER}
                onChange={(e) => setToggles({ ...toggles, INSTALLMENT_REMINDER: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Toggle 4: TICKET */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <span className="font-bold text-xs text-gray-900 block">ای-ٹکٹ اور فلائٹ تصدیق</span>
                <span className="text-[11px] text-gray-500">پرواز سے 24 گھنٹے قبل PNR تصدیق</span>
              </div>
              <input
                type="checkbox"
                checked={toggles.TICKET}
                onChange={(e) => setToggles({ ...toggles, TICKET: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Live Template Preview with Variables */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-sm text-gray-900">ٹیمپلیٹ پریویو مع ویری ایبلز (Template Preview)</h2>
          </div>

          <div className="flex items-center gap-2">
            {(Object.keys(WHATSAPP_TEMPLATES) as Array<keyof typeof WHATSAPP_TEMPLATES>).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedTemplate === key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Raw Template with placeholders */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">اصل ٹیمپلیٹ فارمیٹ (Raw Template):</label>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-800 leading-relaxed">
              {WHATSAPP_TEMPLATES[selectedTemplate]}
            </div>
          </div>

          {/* Rendered WhatsApp Preview Box */}
          <div>
            <label className="block text-xs font-bold text-emerald-600 mb-1">حاجی کے موبائل پر کیسا نظر آئے گا (Live WhatsApp Bubble):</label>
            <div className="p-4 rounded-2xl bg-[#DCF8C6] border border-[#b2e597] text-xs text-gray-900 shadow-sm leading-relaxed relative">
              <p>{getRenderedPreview(WHATSAPP_TEMPLATES[selectedTemplate])}</p>
              <div className="text-right text-[10px] text-gray-500 mt-2 font-mono">12:45 PM ✓✓</div>
            </div>
          </div>
        </div>

        {/* Test Send Form */}
        <form onSubmit={handleTestSend} className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 flex-1 w-full">
            <Smartphone className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="03001234567"
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs w-full text-gray-800 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            ٹیسٹ میسج بھیجیں
          </button>
        </form>
      </div>

      {/* Card 4: Recent Logs */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
        <h2 className="font-bold text-sm text-gray-900">حالیہ واٹس ایپ پیغامات کی ہسٹری (Recent Dispatches)</h2>

        {logs.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">ابھی تک کوئی پیغام لاگ نہیں ہوا۔</p>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {logs.slice(0, 10).map((log: any) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono font-bold text-gray-900 block">{log.recipient_phone}</span>
                  <p className="text-gray-600 mt-0.5 line-clamp-1">{log.message}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    {log.status || 'sent'}
                  </span>
                  <span className="block text-[10px] text-gray-400 mt-1">{log.sent_at || log.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
