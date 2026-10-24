'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import {
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  UserCheck,
  CreditCard,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Plane,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatMRZDate(yymmdd: string | null | undefined, isExpiry: boolean = false): string {
  if (!yymmdd || yymmdd.length < 6) return '';
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  if (isNaN(yy)) return '';
  const fullYear = isExpiry
    ? (2000 + yy).toString()
    : (yy > 40 ? 1900 + yy : 2000 + yy).toString();
  return `${dd}-${mm}-${fullYear}`;
}

export default function NewPilgrimPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: groupsData } = useSWR('/api/groups', fetcher);
  const groups = groupsData?.groups || [];

  const { data: subAgentsData } = useSWR('/api/sub-agents', fetcher);
  const subAgents = subAgentsData?.subAgents || [];

  const getCommissionDisplay = (agent: any) => {
    const type = agent.commissionType || agent.commission_type || agent.type || 'fixed';
    const value =
      agent.commissionValue !== undefined && agent.commissionValue !== null
        ? agent.commissionValue
        : agent.commission_value !== undefined && agent.commission_value !== null
        ? agent.commission_value
        : agent.commission_per_haji !== undefined && agent.commission_per_haji !== null
        ? agent.commission_per_haji
        : agent.commission || 0;

    if (
      type === 'percentage' ||
      type === 'percent' ||
      type === 'commission' ||
      String(value).includes('%')
    ) {
      return `${value}% کمیشن`;
    } else {
      return `Rs. ${Number(value).toLocaleString()} کمیشن`;
    }
  };

  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [detectedMRZLines, setDetectedMRZLines] = useState<string[]>([]);
  const [pulseGlow, setPulseGlow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    group_id: '',
    sub_agent_id: '',
    full_name: '',
    father_name: '',
    passport_no: '',
    passport_expiry: '',
    dob: '',
    cnic: '',
    phone: '',
    pnr: '',
    photo_url: '',
    passport_scan_url: '',
    passport_scan_data: null as any,
    visa_status: 'document_pending',
    payment_total: '285000',
    payment_paid: '50000',
  });

  // IMAGE PREPROCESS (Zaroori):
  // Take image, create canvas. Crop ONLY bottom 35% of passport (where MRZ is).
  // Convert to grayscale, increase contrast by 2x, upscale image to 2x size.
  const preprocessPassportImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const originalWidth = img.naturalWidth || img.width;
            const originalHeight = img.naturalHeight || img.height;

            // Crop ONLY bottom 35% of passport (where MRZ is)
            const cropHeight = originalHeight * 0.35;
            const cropStartY = originalHeight * 0.65;

            // Upscale image to 2x size
            const targetWidth = Math.floor(originalWidth * 2);
            const targetHeight = Math.floor(cropHeight * 2);

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
              return resolve(img.src);
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw cropped bottom 35% upscaled 2x
            ctx.drawImage(
              img,
              0,
              cropStartY,
              originalWidth,
              cropHeight,
              0,
              0,
              targetWidth,
              targetHeight
            );

            // Convert to grayscale, increase contrast by 2x
            const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              // Luminance grayscale
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              // Increase contrast by 2x
              const contrasted = (gray - 128) * 2 + 128;
              const finalVal = Math.min(255, Math.max(0, contrasted));

              data[i] = finalVal;
              data[i + 1] = finalVal;
              data[i + 2] = finalVal;
            }
            ctx.putImageData(imageData, 0, 0);

            resolve(canvas.toDataURL('image/png'));
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Client-side MRZ Scanner (No AI, No API Key)
  const scanPassportMRZ = async (file: File) => {
    if (!file) return;

    setScanning(true);
    setScanSuccess(false);
    setSuccessMsg('');
    setErrorMsg('');
    setDetectedMRZLines([]);

    try {
      // 1. IMAGE PREPROCESS (Zaroori)
      const croppedImage = await preprocessPassportImage(file);

      // 2. TESSERACT CONFIG
      const Tesseract = (await import('tesseract.js')).default;
      const { parse } = await import('mrz');

      // Use this exact config:
      const { data: { text } } = await Tesseract.recognize(croppedImage, 'eng', {
        // @ts-ignore
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
        // @ts-ignore
        psm: 6,
      });

      // 3. MRZ FILTER
      const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const cleanedLines = rawLines.map((l) =>
        l.replace(/\s+/g, '').toUpperCase().replace(/[«‹]/g, '<')
      );

      // Reject any line like TBLFT or PASSPORT
      const filteredLines = cleanedLines.filter((l) => {
        if (l.includes('TBLFT') || l.includes('PASSPORT')) return false;
        if (!l.includes('<')) return false;
        return true;
      });

      // From OCR text, find ONLY lines that are 44 characters long and contain P<PAK or PK.
      // If not found, find lines that have << and length > 30.
      let line1Candidates = filteredLines.filter(
        (l) => (l.includes('P<PAK') || l.includes('P<PK') || l.includes('P<')) && l.length === 44
      );
      if (line1Candidates.length === 0) {
        line1Candidates = filteredLines.filter(
          (l) => (l.includes('P<PAK') || l.includes('P<PK') || l.includes('P<')) && l.length > 30
        );
      }
      if (line1Candidates.length === 0) {
        line1Candidates = filteredLines.filter((l) => l.includes('<<') && l.length > 30);
      }

      if (line1Candidates.length === 0) {
        throw new Error('تصویر کے نچلے حصے میں پاسپورٹ MRZ لائن نہیں مل سکی۔ آپ معلومات ہاتھ سے درج کر سکتے ہیں۔');
      }

      const normalize44 = (str: string) => {
        let s = str.trim().toUpperCase();
        const pIndex = s.indexOf('P<');
        if (pIndex > 0) s = s.slice(pIndex);
        if (s.length < 44) return s.padEnd(44, '<');
        return s.slice(0, 44);
      };

      // Form candidate pairs
      const candidatePairs: string[][] = [];
      for (const l1 of line1Candidates) {
        const idx = filteredLines.indexOf(l1);
        if (idx !== -1 && idx + 1 < filteredLines.length) {
          candidatePairs.push([normalize44(l1), normalize44(filteredLines[idx + 1])]);
        }
        for (const l2 of filteredLines) {
          if (l2 !== l1 && l2.length > 30 && !l2.startsWith('P<')) {
            candidatePairs.push([normalize44(l1), normalize44(l2)]);
          }
        }
      }

      if (candidatePairs.length === 0) {
        if (filteredLines.length >= 2) {
          candidatePairs.push([
            normalize44(filteredLines[filteredLines.length - 2]),
            normalize44(filteredLines[filteredLines.length - 1]),
          ]);
        }
      }

      if (candidatePairs.length === 0) {
        throw new Error('MRZ کی دوسری لائن نہیں مل سکی۔ آپ معلومات دستی طور پر درج کر سکتے ہیں۔');
      }

      // Parse ONLY those 2 MRZ lines with mrz library.
      // Validate checksum, if checksum fails, try second best OCR result.
      let bestResult: any = null;
      let bestPair: string[] = [];
      let secondBestResult: any = null;
      let secondBestPair: string[] = [];

      for (const pair of candidatePairs) {
        try {
          const parsed = parse(pair);
          if (parsed?.valid) {
            bestResult = parsed;
            bestPair = pair;
            break;
          } else if (!secondBestResult && parsed?.fields) {
            secondBestResult = parsed;
            secondBestPair = pair;
          }
        } catch (err) {
          // Continue if format error
        }
      }

      const chosenResult = bestResult || secondBestResult;
      const chosenPair =
        bestPair.length > 0
          ? bestPair
          : secondBestPair.length > 0
          ? secondBestPair
          : candidatePairs[0];

      // SHOW MRZ LINES: In UI, show the 2 detected MRZ lines in a small box so user can verify
      setDetectedMRZLines(chosenPair);

      let documentNumber = '';
      let firstName = '';
      let lastName = '';
      let birthDate = '';
      let expiryDate = '';
      let nationality = '';
      let sex = '';

      if (chosenResult?.fields) {
        const f = chosenResult.fields;
        documentNumber = (f.documentNumber || '').replace(/</g, '').trim().toUpperCase();
        firstName = (f.firstName || '').replace(/</g, ' ').trim().toUpperCase();
        lastName = (f.lastName || '').replace(/</g, ' ').trim().toUpperCase();
        birthDate = formatMRZDate(f.birthDate, false);
        expiryDate = formatMRZDate(f.expirationDate || f.expiryDate, true);
        nationality = (f.nationality || f.issuingState || '').replace(/</g, '').trim().toUpperCase();
        sex = (f.sex || '').toUpperCase();
      } else {
        // Fallback line slicing if mrz parse threw
        const line1 = chosenPair[0];
        const line2 = chosenPair[1];
        const namePart = line1.slice(5);
        const [lastPart, firstPart] = namePart.split('<<');
        lastName = (lastPart || '').replace(/</g, ' ').trim().toUpperCase();
        firstName = (firstPart || '').replace(/</g, ' ').trim().toUpperCase();
        documentNumber = line2.slice(0, 9).replace(/</g, '').trim().toUpperCase();
        nationality = line2.slice(10, 13).replace(/</g, '').trim().toUpperCase();
        birthDate = formatMRZDate(line2.slice(13, 19), false);
        sex = line2.charAt(20).toUpperCase();
        expiryDate = formatMRZDate(line2.slice(21, 27), true);
      }

      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

      if (!documentNumber && !fullName) {
        throw new Error('MRZ سے ڈیٹا حاصل نہیں ہو سکا۔ آپ معلومات دستی درج کر سکتے ہیں۔');
      }

      // Auto-fill form fields: passport number, full name, DOB, expiry, father name.
      setForm((prev) => ({
        ...prev,
        passport_no: documentNumber || prev.passport_no,
        full_name: fullName || prev.full_name,
        dob: birthDate || prev.dob,
        passport_expiry: expiryDate || prev.passport_expiry,
        father_name: prev.father_name,
        passport_scan_data: {
          documentNumber,
          firstName,
          lastName,
          birthDate,
          expiryDate,
          nationality,
          sex,
          mrz: chosenPair.join('\n'),
        },
      }));

      // Show message: "MRZ se data mil gaya" on success.
      setSuccessMsg('MRZ se data mil gaya');
      setScanSuccess(true);
      setPulseGlow(true);
      setTimeout(() => setPulseGlow(false), 4000);
      setScanModalOpen(false);
    } catch (err: any) {
      console.error('MRZ OCR error:', err);
      // Keep manual input if OCR fails.
      setErrorMsg(err.message || 'MRZ اسکین نہیں ہو سکا۔ آپ معلومات خود ہاتھ سے (Manually) درج کر سکتے ہیں۔');
    } finally {
      setScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) scanPassportMRZ(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.passport_no) {
      setErrorMsg('براہ کرم پورا نام اور پاسپورٹ نمبر درج کریں');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/pilgrims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || 'زائر شامل کرنے میں خرابی');
        setSubmitting(false);
        return;
      }

      router.push(form.group_id ? `/dashboard/groups/${form.group_id}` : '/dashboard/pilgrims');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'خرابی پیش آگئی');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden max-w-4xl mx-auto space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pilgrims"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-urdu text-[18px] sm:text-[22px] md:text-[26px] font-bold leading-[1.4] break-words text-gray-900">نیا حاجی / زائر رجسٹر کریں (New Haji)</h1>
            <p className="text-xs text-gray-500 break-words">پاسپورٹ MRZ خودکار اسکین یا دستی اندراج</p>
          </div>
        </div>

        {/* Top Button */}
        <button
          type="button"
          onClick={() => setScanModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-700 flex items-center gap-2 transition"
        >
          <Camera className="w-4 h-4" />
          🛂 Passport MRZ Scan - Photo se Data Auto
        </button>
      </div>

      {/* DRAG-DROP SCAN MODAL */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-gray-900">پاسپورٹ MRZ اسکینر (Bottom 35%)</h3>
              </div>
              <button
                onClick={() => setScanModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 rounded-2xl p-8 text-center bg-emerald-50/50 hover:bg-emerald-50 transition cursor-pointer space-y-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) scanPassportMRZ(f);
                }}
                accept="image/*"
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
                {scanning ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">
                  {scanning ? 'MRZ کروپ اور اسکین ہو رہا ہے...' : 'Passport photo yahan daalein'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {scanning ? 'نیچے کا 35% حصہ ہائی کنٹراسٹ کر کے MRZ پڑھا جا رہا ہے...' : 'یا کلک کر کے اپنے کمپیوٹر / موبائل سے تصویر منتخب کریں'}
                </p>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                آٹو کروپ + 2x کنٹراسٹ + 44 کریکٹر فلٹر
              </span>
            </div>

            <div className="text-xs text-gray-500 text-center">
              پاسپورٹ نمبر، نام، تاریخ پیدائش، اور ایکسپائری خودکار طور پر درج ہو جائے گی۔
            </div>
          </div>
        </div>
      )}

      {/* SCAN ACCURACY SUCCESS BANNER */}
      {scanSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold block">{successMsg || 'MRZ se data mil gaya'}</span>
              <span className="text-[11px] text-emerald-700">فارم کے خانے خودکار طور پر بھر دیے گئے ہیں۔ (MRZ se data mil gaya)</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-sm">
            MRZ Success
          </span>
        </div>
      )}

      {/* SHOW MRZ LINES: In UI, show the 2 detected MRZ lines in a small box so user can verify */}
      {detectedMRZLines.length >= 2 && (
        <div className="p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-emerald-400 font-mono text-xs shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-sans font-bold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              شناخت شدہ MRZ لائنز (Detected MRZ Lines):
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] border border-emerald-800/60">
              44 Chars / Line
            </span>
          </div>
          <div className="tracking-widest break-all select-all text-[11px] sm:text-xs text-emerald-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            {detectedMRZLines[0]}
          </div>
          <div className="tracking-widest break-all select-all text-[11px] sm:text-xs text-emerald-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            {detectedMRZLines[1]}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* REGISTRATION FORM (Manual Input Always Available) */}
      <form
        onSubmit={handleSubmit}
        className={`bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 space-y-6 transition-all duration-500 ${
          pulseGlow ? 'ring-4 ring-emerald-400 ring-offset-2' : ''
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Group Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              عمرہ / حج گروپ منتخب کریں
            </label>
            <select
              value={form.group_id}
              onChange={(e) => setForm({ ...form, group_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- براہ راست رجسٹریشن (کوئی گروپ نہیں) --</option>
              {groups.map((g: any) => (
                <option key={g.id} value={g.id}>
                  {g.group_name} ({g.available_seats} سیٹیں باقی)
                </option>
              ))}
            </select>
          </div>

          {/* Sub Agent / Referral */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              سب ایجنٹ / ریفرل پارٹنر (اختیاری)
            </label>
            <select
              value={form.sub_agent_id}
              onChange={(e) => setForm({ ...form, sub_agent_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- کوئی سب ایجنٹ نہیں (براہ راست واک اِن) --</option>
              {subAgents.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.city || a.location || a.phone || ''} - {getCommissionDisplay(a)})
                </option>
              ))}
            </select>
          </div>

          {/* Visa Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">ابتدائی ویزہ سٹیٹس</label>
            <select
              value={form.visa_status}
              onChange={(e) => setForm({ ...form, visa_status: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
            >
              <option value="document_pending">دستاویزات زیر التواء (Document Pending)</option>
              <option value="in_embassy">سفارت خانے میں (In Embassy)</option>
              <option value="printed">ویزہ پرنٹ شدہ (Printed)</option>
              <option value="returned">واپس موصول (Returned)</option>
            </select>
          </div>

          {/* PNR optional */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-sky-500" />
              ٹکٹ PNR (اگر موجود ہو)
            </label>
            <input
              type="text"
              value={form.pnr}
              onChange={(e) => setForm({ ...form, pnr: e.target.value.toUpperCase() })}
              placeholder="e.g. PK782X"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              مکمل نام (بحساب پاسپورٹ) *
            </label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="e.g. MUHAMMAD TARIQ"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-semibold ${
                pulseGlow ? 'bg-emerald-50/70 border-emerald-400' : ''
              }`}
            />
          </div>

          {/* Father Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">والد کا نام</label>
            <input
              type="text"
              value={form.father_name}
              onChange={(e) => setForm({ ...form, father_name: e.target.value })}
              placeholder="e.g. ABDUL REHMAN"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 ${
                pulseGlow ? 'bg-emerald-50/70 border-emerald-400' : ''
              }`}
            />
          </div>

          {/* Passport No */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">پاسپورٹ نمبر *</label>
            <input
              type="text"
              required
              value={form.passport_no}
              onChange={(e) => setForm({ ...form, passport_no: e.target.value })}
              placeholder="e.g. AB1234567"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-mono font-bold ${
                pulseGlow ? 'bg-emerald-50/70 border-emerald-400' : ''
              }`}
            />
          </div>

          {/* Date of Birth (DOB) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              تاریخ پیدائش (DOB DD-MM-YYYY)
            </label>
            <input
              type="text"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              placeholder="DD-MM-YYYY"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 ${
                pulseGlow ? 'bg-emerald-50/70 border-emerald-400' : ''
              }`}
            />
          </div>

          {/* Passport Expiry */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              پاسپورٹ تاریخ تنسیخ (Expiry DD-MM-YYYY)
            </label>
            <input
              type="text"
              value={form.passport_expiry}
              onChange={(e) => setForm({ ...form, passport_expiry: e.target.value })}
              placeholder="DD-MM-YYYY"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 ${
                pulseGlow ? 'bg-emerald-50/70 border-emerald-400' : ''
              }`}
            />
          </div>

          {/* CNIC */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">شناختی کارڈ (CNIC)</label>
            <input
              type="text"
              value={form.cnic}
              onChange={(e) => setForm({ ...form, cnic: e.target.value })}
              placeholder="e.g. 35202-1234567-1"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-mono ${
                pulseGlow ? 'bg-emerald-50/70 border-emerald-400' : ''
              }`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">فون / واٹس ایپ نمبر</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="03001234567"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Total */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">کل رقم (PKR)</label>
            <input
              type="number"
              value={form.payment_total}
              onChange={(e) => setForm({ ...form, payment_total: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          {/* Payment Paid (Advance) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">ادا شدہ ایڈوانس (PKR)</label>
            <input
              type="number"
              value={form.payment_paid}
              onChange={(e) => setForm({ ...form, payment_paid: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/dashboard/pilgrims"
            className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
          >
            منسوخ کریں
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition disabled:opacity-50"
          >
            {submitting ? 'محفوظ ہو رہا ہے...' : '✓ زائر رجسٹر کریں'}
          </button>
        </div>
      </form>
    </div>
  );
}
