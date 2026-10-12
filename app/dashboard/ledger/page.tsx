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
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">مکمل کھاتہ اور حساب کتاب (Ledger)</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-semibold">
              ماڈیول 5 (سب سے اہم)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            گاہکوں اور سپلائرز کا خودکار بقایا، ٹائم لائن، واٹس ایپ رسید اور لائیو QR تصدیق
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'customers' ? (
            <button
              onClick={() => setShowAddCustModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + نیا گاہک کھاتہ
            </button>
          ) : (
            <button
              onClick={() => setShowAddSuppModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + نیا سپلائر کھاتہ
            </button>
          )}
        </div>
      </div>

      {/* TOP 3 FINANCIAL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Receivable */}
        <div className="p-5 rounded-3xl bg-slate-950/80 border border-emerald-500/30 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-semibold">کل واجب الوصول (Receivable - گاہکوں سے لینی ہے)</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {formatCurrency(totalReceivable)}
            </div>
            <span className="text-[11px] text-emerald-300/70 font-medium">مارکیٹ بقایا جات</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        {/* Total Payable */}
        <div className="p-5 rounded-3xl bg-slate-950/80 border border-rose-500/30 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-300 font-semibold">کل واجب الادا (Payable - سپلائرز کو دینی ہے)</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
              {formatCurrency(totalPayable)}
            </div>
            <span className="text-[11px] text-rose-300/70 font-medium">ہوٹلز، ایئرلائنز، ویزہ فیس</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="p-5 rounded-3xl bg-slate-950/80 border border-teal-500/30 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-teal-300 font-semibold">خالص کیش فلو (Net Cash Flow)</span>
            <div className={`text-2xl sm:text-3xl font-black mt-1 ${netCashFlow >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
              {formatCurrency(netCashFlow)}
            </div>
            <span className="text-[11px] text-teal-300/70 font-medium">پوزیشن: کیش سرپلس</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TABS: CUSTOMERS VS SUPPLIERS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'customers'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          کسٹمرز کھاتہ (Customers - Who Owes Us) ({customers.length})
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'suppliers'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          سپلائرز کھاتہ (Suppliers - We Owe) ({suppliers.length})
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="گاہک یا فون نمبر تلاش کریں..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
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
                  className={`p-5 rounded-3xl bg-slate-950/80 border transition shadow-xl cursor-pointer ${
                    isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-base text-white">{cust.customer_name}</h3>
                      <span className="text-xs text-slate-400 block mt-0.5">فون: {cust.phone || '-'}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase">باقی واجب الادا (Remaining)</span>
                      <span className={`text-lg font-black ${remaining > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[10px] block">کل پیکیج:</span>
                      <strong>{formatCurrency(cust.total_payable)}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">ادا شدہ:</span>
                      <strong className="text-emerald-400">{formatCurrency(cust.total_paid)}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                          setShowPayModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
                      >
                        + رقم وصول کریں
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Customer Timeline Details (1 Col on lg) */}
          <div className="rounded-3xl bg-slate-950/90 border border-slate-800 p-6 shadow-xl space-y-4">
            {selectedCustomer ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-base text-white">{selectedCustomer.customer_name}</h3>
                    <span className="text-xs text-slate-400">ٹرانزیکشن ٹائم لائن ({selectedCustomer.transactions?.length || 0})</span>
                  </div>
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    + وصولی درج کریں
                  </button>
                </div>

                {/* Timeline Transactions */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {(selectedCustomer.transactions || []).map((tx: any) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sky-400 font-bold">{tx.receipt_no}</span>
                        <span className="text-slate-500">{formatDate(tx.date)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-medium">{tx.note || 'ادائیگی'}</span>
                        <span className="font-bold text-emerald-400 text-sm">
                          + PKR {(tx.amount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {/* Send WhatsApp Receipt Button */}
                        <button
                          onClick={() => handleSendWhatsAppReceipt(selectedCustomer, tx)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Send className="w-3 h-3 text-emerald-400" />
                          رسید بھیجیں WhatsApp
                        </button>

                        {/* PDF Receipt Link */}
                        <a
                          href={`/api/ledger/receipt/${tx.receipt_no}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[11px] font-medium flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          PDF رسید
                        </a>
                      </div>
                    </div>
                  ))}

                  {(selectedCustomer.transactions || []).length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-8">کوئی ادائیگی ریکارڈ نہیں ہے</p>
                  )}
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">ٹائم لائن اور رسیدوں کے لیے بائیں جانب کسی گاہک پر کلک کریں۔</p>
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
              <div key={s.id} className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-white">{s.supplier_name}</h3>
                    <span className="text-xs text-purple-400 uppercase font-semibold">{s.supplier_type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">واجب الادا</span>
                    <span className="text-base font-bold text-rose-400">{formatCurrency(remaining)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-300">
                  <span>کل بل: {formatCurrency(s.total_payable)}</span>
                  <span className="text-emerald-400">ادا شدہ: {formatCurrency(s.total_paid)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">رقم وصولی کا اندراج (Receive Payment)</h3>
            <p className="text-xs text-slate-400 mb-4">گاہک: {selectedCustomer?.customer_name}</p>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">وصول شدہ رقم (PKR)*</label>
                <input
                  type="number"
                  required
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">طریقہ ادائیگی (Payment Method)</label>
                <select
                  value={txForm.method}
                  onChange={(e) => setTxForm({ ...txForm, method: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="cash">کیش (Cash)</option>
                  <option value="bank">بینک ٹرانسفر (Bank)</option>
                  <option value="easypaisa">ایزی پیسہ (Easypaisa)</option>
                  <option value="jazzcash">جاز کیش (Jazzcash)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">تفصیل / نوٹ</label>
                <input
                  type="text"
                  value={txForm.note}
                  onChange={(e) => setTxForm({ ...txForm, note: e.target.value })}
                  placeholder="عمرہ ایڈوانس قسط نمبر 2"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">+ نیا گاہک کھاتہ بنائیں</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">گاہک کا نام*</label>
                <input
                  type="text"
                  required
                  placeholder="محمد شفیق"
                  value={newCustForm.customer_name}
                  onChange={(e) => setNewCustForm({ ...newCustForm, customer_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">فون نمبر (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="03001234567"
                  value={newCustForm.phone}
                  onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">کل پیکیج رقم (PKR)</label>
                <input
                  type="number"
                  value={newCustForm.total_payable}
                  onChange={(e) => setNewCustForm({ ...newCustForm, total_payable: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  منسوخ
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
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
