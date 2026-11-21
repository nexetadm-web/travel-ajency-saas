'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  FileText,
  RotateCcw,
  Sparkles,
  Keyboard,
  Info,
} from 'lucide-react';
import Modal from '@/components/ui/modal';
import { parseMRZLines, extractMRZLinesFromText, ParsedMRZResult } from '@/lib/mrz';

export interface PassportScanData extends ParsedMRZResult {
  confidence: number;
}

interface PassportScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: PassportScanData) => void;
}

export function PassportScanButton({
  onClick,
  className = '',
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm hover:shadow transition select-none ${className}`}
    >
      <Camera className="w-3.5 h-3.5" />
      <span>Passport Scan Karein (Free)</span>
    </button>
  );
}

export default function PassportScannerModal({
  isOpen,
  onClose,
  onScanComplete,
}: PassportScannerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [croppedMRZPreview, setCroppedMRZPreview] = useState<string | null>(null);

  const [scanning, setScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [scannedResult, setScannedResult] = useState<PassportScanData | null>(null);

  // Manual fallback inputs
  const [manualLine1, setManualLine1] = useState('');
  const [manualLine2, setManualLine2] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetAll();
    }
  }, [isOpen]);

  const resetAll = () => {
    setSelectedFile(null);
    setOriginalPreview(null);
    setCroppedMRZPreview(null);
    setScanning(false);
    setStatusMsg('');
    setErrorMsg('');
    setWarningMsg('');
    setScannedResult(null);
    setManualLine1('');
    setManualLine2('');
    setMode('upload');
  };

  /**
   * STEP 2: IMAGE PREPROCESSING (Canvas)
   * - Crop bottom 30% of image (y = 70% to 100%)
   * - Convert to grayscale, increase contrast, threshold to black & white
   * - Resize to 2x for better OCR
   */
  const preprocessImage = async (file: File): Promise<{ originalUrl: string; croppedUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const originalUrl = e.target?.result as string;
        const img = new Image();

        img.onload = () => {
          try {
            const originalWidth = img.naturalWidth || img.width;
            const originalHeight = img.naturalHeight || img.height;

            // Crop bottom 30% (y = 70% to 100%)
            const cropStartY = originalHeight * 0.70;
            const cropHeight = originalHeight * 0.30;

            // Resize to 2x for better OCR
            const targetWidth = Math.floor(originalWidth * 2);
            const targetHeight = Math.floor(cropHeight * 2);

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            if (!ctx) {
              return resolve({ originalUrl, croppedUrl: originalUrl });
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw cropped bottom 30% upscaled 2x
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

            // Convert to grayscale, increase contrast, threshold to black & white
            const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
            const data = imageData.data;

            // Compute average luminance for adaptive threshold
            let sumLum = 0;
            const pixelCount = data.length / 4;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              sumLum += gray;
            }
            const avgLum = sumLum / pixelCount;
            // Adaptive threshold
            const threshold = Math.min(Math.max(avgLum, 105), 155);

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              // Grayscale
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              // Increase contrast
              const contrasted = (gray - 128) * 2.2 + 128;
              // Threshold to black & white
              const bw = contrasted > threshold ? 255 : 0;

              data[i] = bw;
              data[i + 1] = bw;
              data[i + 2] = bw;
            }

            ctx.putImageData(imageData, 0, 0);
            const croppedUrl = canvas.toDataURL('image/png');
            resolve({ originalUrl, croppedUrl });
          } catch (err) {
            reject(err);
          }
        };

        img.onerror = () => reject(new Error('تصویر لوڈ کرنے میں ناکامی'));
        img.src = originalUrl;
      };

      reader.onerror = () => reject(new Error('فائل پڑھنے میں ناکامی'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('تصویر کا سائز 10MB سے زیادہ نہیں ہونا چاہیے (Max 10MB allowed)');
      return;
    }

    // Validate format
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setErrorMsg('صرف JPG یا PNG فائل منتخب کریں (Only JPG/PNG supported)');
      return;
    }

    setErrorMsg('');
    setWarningMsg('');
    setSelectedFile(file);
    setScannedResult(null);

    try {
      const { originalUrl, croppedUrl } = await preprocessImage(file);
      setOriginalPreview(originalUrl);
      setCroppedMRZPreview(croppedUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'تصویر پراسیسنگ میں خرابی پیش آگئی');
    }
  };

  /**
   * STEP 3: OCR via Tesseract.js (Dynamic Import)
   */
  const handlePerformOCR = async () => {
    if (!croppedMRZPreview) return;

    setScanning(true);
    setErrorMsg('');
    setWarningMsg('');
    setStatusMsg('Scan ho raha hai... 3-4 second lagein ge');

    try {
      // Dynamic import in Next.js to prevent Vercel build failure
      const Tesseract = (await import('tesseract.js')).default;

      // Run OCR ONLY on cropped MRZ image
      const { data } = await Tesseract.recognize(croppedMRZPreview, 'eng', {
        // @ts-ignore
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
        // @ts-ignore
        tessedit_pageseg_mode: '6',
      });

      const ocrText = data?.text || '';
      const confidence = data?.confidence || 0;

      // Check confidence < 70%
      if (confidence < 70) {
        setWarningMsg('Scan saaf nahi hua, please dobara clear photo lein ya manual likhein');
      }

      const mrzPair = extractMRZLinesFromText(ocrText);
      if (!mrzPair) {
        setErrorMsg('پاسپورٹ کے نچلے حصے سے MRZ کوڈ نہیں مل سکا۔ آپ "Manual Entry" کے ذریعے درج کر سکتے ہیں۔');
        setScanning(false);
        setStatusMsg('');
        return;
      }

      const parsed = parseMRZLines(mrzPair.line1, mrzPair.line2);

      if (!parsed.check_digits_valid && parsed.warnings.length > 0) {
        setWarningMsg(
          (prev) => (prev ? prev + ' | ' : '') + 'چیک ڈیجٹ تصدیق مکمل نہیں ہوئی، براہ کرم معلومات دیکھ لیں'
        );
      }

      const finalData: PassportScanData = {
        ...parsed,
        confidence,
      };

      setScannedResult(finalData);
      onScanComplete(finalData);
      setStatusMsg('');
    } catch (err: any) {
      console.error('OCR Error:', err);
      setErrorMsg(err.message || 'اسکیننگ کے دوران خرابی پیش آگئی۔ آپ دستی درج کر سکتے ہیں۔');
    } finally {
      setScanning(false);
    }
  };

  /**
   * STEP 6: FALLBACK (Manual Entry of 2 MRZ lines)
   */
  const handleManualParse = () => {
    setErrorMsg('');
    setWarningMsg('');

    if (!manualLine1.trim() || !manualLine2.trim()) {
      setErrorMsg('براہ کرم دونوں MRZ لائنیں درج کریں');
      return;
    }

    try {
      const parsed = parseMRZLines(manualLine1, manualLine2);
      const finalData: PassportScanData = {
        ...parsed,
        confidence: 100,
      };

      if (!parsed.check_digits_valid && parsed.warnings.length > 0) {
        setWarningMsg('چیک ڈیجٹ وارننگ: براہ کرم ڈیٹا کی تصدیق کر لیں');
      }

      setScannedResult(finalData);
      onScanComplete(finalData);
    } catch (err: any) {
      setErrorMsg(err.message || 'MRZ ڈیٹا کو پارس نہیں کیا جا سکا');
    }
  };

  const handleApplySampleMRZ = () => {
    setManualLine1('P<PAKAHMED<<ALI<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    setManualLine2('PK12345678PAK9001015M3001015<<<<<<<<<<<<<<');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-gray-900">پاسپورٹ اسکینر (100% Free MRZ OCR)</span>
        </div>
      }
      maxWidth="640px"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'upload' ? 'manual' : 'upload');
                setErrorMsg('');
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition"
            >
              <Keyboard className="w-3.5 h-3.5 text-indigo-600" />
              <span>{mode === 'upload' ? 'Manual Entry (دستی درج کریں)' : 'تصویر اپلوڈ پر واپس جائیں'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
            >
              بند کریں
            </button>

            {scannedResult && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>فارم میں لاگو ہو گیا ✓</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-right" dir="rtl">
        {/* Alerts & Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {warningMsg && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{warningMsg}</span>
          </div>
        )}

        {mode === 'upload' ? (
          <div className="space-y-4">
            {/* 1. Upload box */}
            {!croppedMRZPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-6 text-center cursor-pointer transition space-y-3 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">
                    پاسپورٹ کا تصویری صفحہ اپلوڈ کریں
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    صرف JPG یا PNG تصویر (زیادہ سے زیادہ 10MB)
                  </p>
                </div>
                <div className="inline-block px-3 py-1 bg-gray-100 rounded-lg text-[11px] text-gray-600 font-mono">
                  100% Free Client-side Tesseract.js (No API Key Required)
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 2. Image Preprocessing Preview (Cropped bottom 30%) */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      کروپ شدہ MRZ ایریا (نیچے کا 30%)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setCroppedMRZPreview(null);
                        setOriginalPreview(null);
                        setScannedResult(null);
                      }}
                      className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>دوسری تصویر منتخب کریں</span>
                    </button>
                  </div>

                  {/* Cropped MRZ Preview Image */}
                  <div className="relative border border-gray-300 rounded-xl overflow-hidden bg-black flex items-center justify-center p-1">
                    <img
                      src={croppedMRZPreview}
                      alt="Cropped MRZ Area"
                      className="max-h-36 w-full object-contain filter contrast-125"
                    />
                  </div>

                  {/* User verification prompt */}
                  <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-center">
                    <p className="text-xs font-bold text-sky-900 font-urdu">
                      Kya ye 2 lines saaf nazar aa rahi hain?
                    </p>
                    <p className="text-[11px] text-sky-700 mt-0.5">
                      کیا نیچے لکھی ہوئی 2 سطریں (P&lt;PAK...) واضح اور پڑھنے کے قابل ہیں؟
                    </p>
                  </div>

                  {/* OCR Action Button */}
                  {!scannedResult && (
                    <button
                      type="button"
                      disabled={scanning}
                      onClick={handlePerformOCR}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {scanning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Scan ho raha hai... 3-4 second lagein ge</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>ہاں، اسکین کریں (Scan MRZ)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STEP 6: MANUAL ENTRY FALLBACK */
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Keyboard className="w-3 h-3" />
                <span>دستی MRZ انٹری (Manual Entry Fallback)</span>
              </span>
              <button
                type="button"
                onClick={handleApplySampleMRZ}
                className="text-[11px] font-bold text-indigo-600 hover:underline bg-white px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs"
              >
                + ٹیسٹ سیمپل بھریں (Sample MRZ)
              </button>
            </div>

            <p className="text-xs text-gray-500">
              اگر تصویر کا اسکین نہ ہو سکے، تو پاسپورٹ کے نچلے حصے پر درج دونوں 44 حروف کی لائنیں یہاں لکھیں:
            </p>

            <div className="space-y-2 font-mono">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  MRZ Line 1 (P&lt;PAK...):
                </label>
                <input
                  type="text"
                  maxLength={44}
                  value={manualLine1}
                  onChange={(e) => setManualLine1(e.target.value.toUpperCase())}
                  placeholder="P<PAKAHMED<<ALI<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono tracking-wider focus:outline-none focus:border-indigo-500 text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  MRZ Line 2 (Passport, Nationality, DOB, Expiry):
                </label>
                <input
                  type="text"
                  maxLength={44}
                  value={manualLine2}
                  onChange={(e) => setManualLine2(e.target.value.toUpperCase())}
                  placeholder="PK12345678PAK9001015M3001015<<<<<<<<<<<<<<"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono tracking-wider focus:outline-none focus:border-indigo-500 text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualParse}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>پارس کریں اور فارم بھریں (Parse & Auto-Fill)</span>
            </button>
          </div>
        )}

        {/* 5. AUTO-FILL RESULT DISPLAY */}
        {scannedResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ڈیٹا کامیابی سے پڑھ لیا گیا اور فارم میں منتقل کر دیا گیا!</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Confidence: {Math.round(scannedResult.confidence)}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] text-gray-500 block">پاسپورٹ نمبر:</span>
                <span className="font-mono font-black text-gray-900 text-sm">{scannedResult.passport_no}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] text-gray-500 block">مکمل نام:</span>
                <span className="font-bold text-gray-900 truncate block">{scannedResult.full_name}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] text-gray-500 block">تاریخ پیدائش (DOB):</span>
                <span className="font-mono font-bold text-gray-900">{scannedResult.dob}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] text-gray-500 block">تاریخ تنسیخ (Expiry):</span>
                <span className="font-mono font-bold text-gray-900">{scannedResult.expiry}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] text-gray-500 block">جنس (Gender):</span>
                <span className="font-bold text-gray-900">{scannedResult.gender === 'M' ? 'مرد (Male)' : scannedResult.gender === 'F' ? 'عورت (Female)' : scannedResult.gender}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] text-gray-500 block">قومیت (Nationality):</span>
                <span className="font-bold text-gray-900">{scannedResult.nationality}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
