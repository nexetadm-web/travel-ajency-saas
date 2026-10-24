import Tesseract from 'tesseract.js';
import { parse as parseMRZ } from 'mrz';

export interface PassportExtractionResult {
  full_name: string;
  name: string;
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
}

export function formatMRZDate(yymmdd: string | null | undefined, isExpiry: boolean = false): string {
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

export function parseMRZFromLines(rawLines: string[]): Partial<PassportExtractionResult> {
  const candidateLines = rawLines
    .map((l) => l.replace(/\s+/g, '').toUpperCase().replace(/[«‹]/g, '<'))
    .filter((l) => l.includes('<'));

  let mrzLines: string[] = [];
  const pIndex = candidateLines.findIndex((l) => l.includes('P<'));
  if (pIndex !== -1 && candidateLines.length > pIndex + 1) {
    let line1 = candidateLines[pIndex];
    let line2 = candidateLines[pIndex + 1];
    const pSub = line1.indexOf('P<');
    if (pSub > 0) line1 = line1.slice(pSub);
    mrzLines = [line1, line2];
  } else {
    mrzLines = candidateLines.slice(-2);
  }

  if (mrzLines.length < 2) {
    throw new Error('تصویر میں MRZ کوڈ (P<) نہیں ملا');
  }

  // Normalize lines to 44 characters for TD3
  const normalized = mrzLines.map((l) => {
    if (l.length < 44) return l.padEnd(44, '<');
    if (l.length > 44) return l.slice(0, 44);
    return l;
  });

  let parsedFields: any = null;
  try {
    const parseResult = parseMRZ(normalized);
    parsedFields = parseResult?.fields;
  } catch (err) {
    console.warn('MRZ parse error, using fallback regex:', err);
  }

  let passportNo = '';
  let firstName = '';
  let lastName = '';
  let birthDate = '';
  let expiryDate = '';
  let nationality = '';
  let sex = '';

  if (parsedFields) {
    passportNo = (parsedFields.documentNumber || '').replace(/</g, '').trim().toUpperCase();
    firstName = (parsedFields.firstName || '').replace(/</g, ' ').trim().toUpperCase();
    lastName = (parsedFields.lastName || '').replace(/</g, ' ').trim().toUpperCase();
    birthDate = formatMRZDate(parsedFields.birthDate, false);
    expiryDate = formatMRZDate(parsedFields.expirationDate || parsedFields.expiryDate, true);
    nationality = (parsedFields.nationality || parsedFields.issuingState || '').replace(/</g, '').trim().toUpperCase();
    sex = (parsedFields.sex || '').toUpperCase();
  } else {
    const line1 = normalized[0];
    const line2 = normalized[1];
    const namePart = line1.slice(5);
    const [lastPart, firstPart] = namePart.split('<<');
    lastName = (lastPart || '').replace(/</g, ' ').trim().toUpperCase();
    firstName = (firstPart || '').replace(/</g, ' ').trim().toUpperCase();
    passportNo = line2.slice(0, 9).replace(/</g, '').trim().toUpperCase();
    nationality = line2.slice(10, 13).replace(/</g, '').trim().toUpperCase();
    birthDate = formatMRZDate(line2.slice(13, 19), false);
    sex = line2.charAt(20).toUpperCase();
    expiryDate = formatMRZDate(line2.slice(21, 27), true);
  }

  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return {
    full_name: fullName,
    name: fullName,
    passport_no: passportNo,
    dob: birthDate,
    expiry: expiryDate,
    passport_expiry: expiryDate,
    nationality,
    gender: sex,
    father_name: '',
    cnic: '',
    place_of_birth: '',
    mrz: normalized.join('\n'),
  };
}

export async function extractPassportFromImage(imageInput: string | Buffer): Promise<PassportExtractionResult> {
  let imageSource: any = imageInput;

  if (typeof imageInput === 'string' && imageInput.startsWith('data:')) {
    const base64Data = imageInput.replace(/^data:[^;]+;base64,/, '').trim();
    imageSource = Buffer.from(base64Data, 'base64');
  }

  const { data: { text } } = await Tesseract.recognize(imageSource, 'eng');
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const mrzData = parseMRZFromLines(lines);

  return {
    full_name: mrzData.full_name || '',
    name: mrzData.name || '',
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
  };
}
