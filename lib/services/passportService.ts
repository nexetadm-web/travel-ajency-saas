import { parseMRZLines, extractMRZLinesFromText, ParsedMRZResult } from '@/lib/mrz';

export interface PassportExtractionResult {
  full_name: string;
  name: string;
  surname?: string;
  given_name?: string;
  passport_no: string;
  dob: string;
  issue_date: string;
  expiry: string;
  passport_expiry: string;
  nationality: string;
  gender: string;
  father_name: string;
  cnic: string;
  place_of_birth: string;
  mrz: string;
  raw_text?: string;
  confidence?: number;
  warnings?: string[];
  check_digits_valid?: boolean;
}

export function formatMRZDate(yymmdd: string | null | undefined, isExpiry: boolean = false): string {
  if (!yymmdd || yymmdd.length < 6) return '';
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  if (isNaN(yy)) return '';
  const fullYear = isExpiry
    ? (2000 + yy).toString()
    : (yy > 30 ? 1900 + yy : 2000 + yy).toString();
  return `${dd}-${mm}-${fullYear}`;
}

export function parseMRZFromLines(rawLines: string[]): Partial<PassportExtractionResult> {
  const mrzPair = extractMRZLinesFromText(rawLines.join('\n'));
  if (!mrzPair) {
    throw new Error('تصویر میں پاسپورٹ MRZ لائن نہیں مل سکی');
  }

  const result = parseMRZLines(mrzPair.line1, mrzPair.line2);

  return {
    full_name: result.full_name,
    name: result.full_name,
    surname: result.surname,
    given_name: result.given_name,
    passport_no: result.passport_no,
    dob: result.dob,
    expiry: result.expiry,
    passport_expiry: result.expiry,
    nationality: result.nationality,
    gender: result.gender,
    father_name: '',
    cnic: '',
    place_of_birth: '',
    mrz: `${result.line1}\n${result.line2}`,
    warnings: result.warnings,
    check_digits_valid: result.check_digits_valid,
  };
}

export async function extractPassportFromImage(imageInput: string | Buffer): Promise<PassportExtractionResult> {
  let imageSource: any = imageInput;

  if (typeof imageInput === 'string' && imageInput.startsWith('data:')) {
    const base64Data = imageInput.replace(/^data:[^;]+;base64,/, '').trim();
    imageSource = Buffer.from(base64Data, 'base64');
  }

  // Dynamic import of Tesseract to prevent Vercel build failure
  const Tesseract = (await import('tesseract.js')).default;

  const { data } = await Tesseract.recognize(imageSource, 'eng', {
    // @ts-ignore
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
    // @ts-ignore
    tessedit_pageseg_mode: '6',
  });

  const text = data?.text || '';
  const confidence = data?.confidence || 0;
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const mrzData = parseMRZFromLines(lines);

  return {
    full_name: mrzData.full_name || '',
    name: mrzData.name || '',
    surname: mrzData.surname || '',
    given_name: mrzData.given_name || '',
    passport_no: mrzData.passport_no || '',
    dob: mrzData.dob || '',
    issue_date: '',
    expiry: mrzData.expiry || '',
    passport_expiry: mrzData.passport_expiry || '',
    nationality: mrzData.nationality || '',
    gender: mrzData.gender || '',
    father_name: mrzData.father_name || '',
    cnic: '',
    place_of_birth: '',
    mrz: mrzData.mrz || '',
    raw_text: text,
    confidence,
    warnings: mrzData.warnings || [],
    check_digits_valid: mrzData.check_digits_valid,
  };
}
