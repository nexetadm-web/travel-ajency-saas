'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAgency } from '@/hooks/useAgency';
import {
  BookOpen,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Plus,
  Send,
  FileText,
  Clock,
  CheckCircle,
  Building2,
  User,
  Search,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import PremiumCard from '@/components/ui/premium-card';
import ContentCard from '@/components/ui/content-card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LedgerPage() {
  const { agency } = useAgency();
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [search, setSearch] = useState('');

  const { data: custData, mutate: mutateCust, isLoading: loadingCust } = useSWR('/api/ledger/customers', fetcher);
  const { data: suppData, mutate: mutateSupp, isLoading: loadingSupp } = useSWR('/api/ledger/suppliers', fetcher);

  const customers = custData?.customers || [];
  const suppliers = suppData?.suppliers || [];
  const totalReceivable = custData?.totalReceivable || 0;
  const totalPayable = suppData?.totalPayable || 0;
  const netCashFlow = totalReceivable - totalPayable;

  // Selected customer for timeline & transaction
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showAddCustModal, setShowAddCustModal] = useState(false);
  const [showAddSuppModal, setShowAddSuppModal] = useState(false);

  // Transaction form
  const [txForm, setTxForm] = useState({
    amount: '50000',
    type: 'receive',
    method: 'cash',
    note: 'Payment received',
    date: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // New Customer Form
  const [newCustForm, setNewCustForm] = useState({
    customer_name: '',
    phone: '',
    total_payable: '285000',
    type: 'individual',
  });

  // New Supplier Form
  const [newSuppForm, setNewSuppForm] = useState({
    supplier_name: '',
    supplier_type: 'hotel',
    total_payable: '500000',
    phone: '',
  });

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/ledger/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: 'customer',
          ledger_id: selectedCustomer.id,
          ...txForm,
        }),
      });

      if (res.ok) {
        mutateCust();
        setShowPayModal(false);
        setTxForm({ amount: '50000', type: 'receive', method: 'cash', note: 'Payment received', date: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWhatsAppReceipt = (cust: any, tx: any) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003');
    const verifyUrl = `${origin}/verify/${tx.receipt_no}`;
    const agencyName = agency?.name || 'Travel Agency';
    const phone = cust.phone ? cust.phone.replace(/[^0-9]/g, '') : '';

    const text = encodeURIComponent(
      `السلام علیکم محترم ${cust.customer_name}!\nآپ کی ادائیگی PKR ${tx.amount.toLocaleString()} موصول ہو چکی ہے۔\nرسید نمبر: ${tx.receipt_no}\nتاریخ: ${tx.date}\nآن لائن تصدیق کے لیے لنک ملاحظہ کریں:\n${verifyUrl}\nشکریہ،\n${agencyName}`
    );

    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/ledger/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustForm),
    });
    mutateCust();
    setShowAddCustModal(false);
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/ledger/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSuppForm),
    });
    mutateSupp();
    setShowAddSuppModal(false);
  };

  const filteredCustomers = customers.filter((c: any) =>
    c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-urdu text-[20px] sm:text-[26px] md:text-[32px] font-bold leading-[1.4] break-words text-gray-900">مکمل کھاتہ اور لیجر (Financial Ledger)</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shrink-0">
              ماڈیول 5 (محفوظ ڈبل اینٹری)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 break-words leading-relaxed">
            گاہکوں اور سپلائرز کا خودکار بقایا، ٹائم لائن، واٹس ایپ رسید اور لائیو QR تصدیق
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === 'customers' ? (
            <button
              onClick={() => setShowAddCustModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 shrink-0" />
              + نیا گاہک کھاتہ
            </button>
          ) : (
            <button
              onClick={() => setShowAddSuppModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-200 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 shrink-0" />
              + نیا سپلائر کھاتہ
            </button>
          )}
        </div>
      </div>

      {/* TOP 3 FINANCIAL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PremiumCard
          title="کل واجب الوصول (Receivable)"
          value={formatCurrency(totalReceivable)}
          subtitle="گاہکوں سے لینی ہے (مارکیٹ بقایا)"
          icon={ArrowDownRight}
          gradient="cyan"
          trend="وصولیاں"
          trendUp={true}
        />
        <PremiumCard
          title="کل واجب الادا (Payable)"
          value={formatCurrency(totalPayable)}
          subtitle="سپلائرز کو دینی ہے (ہوٹل/ایئرلائن)"
          icon={ArrowUpRight}
          gradient="rose"
          trend="ادائیگیاں"
          trendUp={false}
        />
        <PremiumCard
          title="خالص کیش فلو (Net Cash Flow)"
          value={formatCurrency(netCashFlow)}
          subtitle={netCashFlow >= 0 ? "کیش سرپلس پوزیشن" : "کیش ڈیفیسٹ پوزیشن"}
          icon={DollarSign}
          gradient="emerald"
          trend="بیلنس"
          trendUp={netCashFlow >= 0}
        />
      </div>

      {/* TABS: CUSTOMERS VS SUPPLIERS */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'customers'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <User className="w-4 h-4" />
          کسٹمرز کھاتہ (Customers - Who Owes Us) ({customers.length})
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'suppliers'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          سپلائرز کھاتہ (Suppliers - We Owe) ({suppliers.length})
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="گاہک یا فون نمبر تلاش کریں..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 shadow-sm"
        />
      </div>

      {/* TAB 1: CUSTOMERS LEDGER */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customers List (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            {filteredCustomers.map((cust: any) => {
              const remaining = (cust.total_payable || 0) - (cust.total_paid || 0);
              const isSelected = selectedCustomer?.id === cust.id;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-5 rounded-2xl bg-white border transition shadow-sm cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                  } border-l-4 border-l-emerald-500`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-base text-gray-900">{cust.customer_name}</h3>
                      <span className="text-xs text-gray-500 block mt-0.5">فون: {cust.phone || '-'}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block uppercase font-medium">باقی واجب الادا</span>
                      <span className={`text-lg font-black ${remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                    <div>
                      <span className="text-gray-400 text-[10px] block">کل پیکیج:</span>
                      <strong className="text-gray-900">{formatCurrency(cust.total_payable)}</strong>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[10px] block">ادا شدہ:</span>
                      <strong className="text-emerald-600">{formatCurrency(cust.total_paid)}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                          setShowPayModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition"
                      >
                        + رقم وصول کریں
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredCustomers.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-white border border-gray-100 text-gray-400">
                <User className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
                <p className="text-xs font-semibold">کوئی گاہک کھاتہ نہیں ملا</p>
              </div>
            )}
          </div>

          {/* Customer Timeline Details (1 Col on lg) */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-4">
            {selectedCustomer ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-base text-gray-900">{selectedCustomer.customer_name}</h3>
                    <span className="text-xs text-gray-500">ٹرانزیکشن ٹائم لائن ({selectedCustomer.transactions?.length || 0})</span>
                  </div>
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 transition"
                  >
                    + وصولی درج کریں
                  </button>
                </div>

                {/* Timeline Transactions */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {(selectedCustomer.transactions || []).map((tx: any) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-emerald-700 font-bold">{tx.receipt_no}</span>
                        <span className="text-gray-400 text-[11px]">{formatDate(tx.date)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">{tx.note || 'ادائیگی'}</span>
                        <span className="font-black text-emerald-600 text-sm">
                          + PKR {(tx.amount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between gap-2">
                        {/* Send WhatsApp Receipt Button */}
                        <button
                          onClick={() => handleSendWhatsAppReceipt(selectedCustomer, tx)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <Send className="w-3 h-3 text-emerald-600" />
                          رسید WhatsApp
                        </button>

                        {/* PDF Receipt Link */}
                        <a
                          href={`/api/ledger/receipt/${tx.receipt_no}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-[11px] font-medium flex items-center gap-1 transition shadow-sm"
                        >
                          <FileText className="w-3 h-3 text-gray-500" />
                          PDF رسید
                        </a>
                      </div>
                    </div>
                  ))}

                  {(selectedCustomer.transactions || []).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-8">کوئی ادائیگی ریکارڈ نہیں ہے</p>
                  )}
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
                <p className="text-xs font-semibold text-gray-600">کھاتہ ٹائم لائن</p>
                <p className="text-[11px] text-gray-400 mt-1">تفصیل اور رسیدوں کے لیے بائیں جانب کسی گاہک پر کلک کریں۔</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIERS LEDGER */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s: any) => {
            const remaining = (s.total_payable || 0) - (s.total_paid || 0);
            return (
              <div key={s.id} className="p-5 rounded-2xl bg-white border border-gray-100 border-l-4 border-l-rose-500 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-gray-900">{s.supplier_name}</h3>
                    <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full uppercase font-bold">
                      {s.supplier_type}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-medium">واجب الادا</span>
                    <span className="text-base font-black text-rose-600">{formatCurrency(remaining)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <span>کل بل: <strong className="text-gray-900">{formatCurrency(s.total_payable)}</strong></span>
                  <span className="text-emerald-600 font-bold">ادا شدہ: {formatCurrency(s.total_paid)}</span>
                </div>
              </div>
            );
          })}

          {suppliers.length === 0 && (
            <div className="col-span-full p-12 text-center rounded-2xl bg-white border border-gray-100 text-gray-400">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-rose-500" />
              <p className="text-xs font-semibold">کوئی سپلائر کھاتہ درج نہیں ہے</p>
            </div>
          )}
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">رقم وصولی کا اندراج (Receive Payment)</h3>
            <p className="text-xs text-gray-500 mb-4">گاہک: <strong className="text-gray-800">{selectedCustomer?.customer_name}</strong></p>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">وصول شدہ رقم (PKR)*</label>
                <input
                  type="number"
                  required
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">طریقہ ادائیگی (Payment Method)</label>
                <select
                  value={txForm.method}
                  onChange={(e) => setTxForm({ ...txForm, method: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="cash">کیش (Cash)</option>
                  <option value="bank">بینک ٹرانسفر (Bank)</option>
                  <option value="easypaisa">ایزی پیسہ (Easypaisa)</option>
                  <option value="jazzcash">جاز کیش (Jazzcash)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">تفصیل / نوٹ</label>
                <input
                  type="text"
                  value={txForm.note}
                  onChange={(e) => setTxForm({ ...txForm, note: e.target.value })}
                  placeholder="عمرہ ایڈوانس قسط نمبر 2"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 transition"
                >
                  {submitting ? 'محفوظ ہو رہا ہے...' : 'رسید جاری کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CUSTOMER MODAL */}
      {showAddCustModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">+ نیا گاہک کھاتہ بنائیں</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">گاہک کا نام*</label>
                <input
                  type="text"
                  required
                  placeholder="محمد شفیق"
                  value={newCustForm.customer_name}
                  onChange={(e) => setNewCustForm({ ...newCustForm, customer_name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">فون نمبر (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="03001234567"
                  value={newCustForm.phone}
                  onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">کل پیکیج رقم (PKR)</label>
                <input
                  type="number"
                  value={newCustForm.total_payable}
                  onChange={(e) => setNewCustForm({ ...newCustForm, total_payable: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                >
                  منسوخ
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 transition">
                  کھاتہ بنائیں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUPPLIER MODAL */}
      {showAddSuppModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">+ نیا سپلائر کھاتہ بنائیں</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">سپلائر کا نام*</label>
                <input
                  type="text"
                  required
                  placeholder="سعودی ایئرلائنز / دار الایمان ہوٹل"
                  value={newSuppForm.supplier_name}
                  onChange={(e) => setNewSuppForm({ ...newSuppForm, supplier_name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">سپلائر کی قسم</label>
                <select
                  value={newSuppForm.supplier_type}
                  onChange={(e) => setNewSuppForm({ ...newSuppForm, supplier_type: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="hotel">ہوٹل (Hotel)</option>
                  <option value="airline">ایئرلائن (Airline)</option>
                  <option value="transport">ٹرانسپورٹ (Transport)</option>
                  <option value="visa_agent">ویزہ ایجنٹ (Visa Agent)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">کل واجب الادا رقم (PKR)</label>
                <input
                  type="number"
                  value={newSuppForm.total_payable}
                  onChange={(e) => setNewSuppForm({ ...newSuppForm, total_payable: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSuppModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                >
                  منسوخ
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition">
                  کھاتہ بنائیں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
