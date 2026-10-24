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
    throw new Error('تصویر میں پاسپورٹ MRZ لائن نہیں مل سکی');
  }

  const normalize44 = (str: string) => {
    let s = str.trim().toUpperCase();
    const pIndex = s.indexOf('P<');
    if (pIndex > 0) s = s.slice(pIndex);
    if (s.length < 44) return s.padEnd(44, '<');
    return s.slice(0, 44);
  };

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
    throw new Error('تصویر میں MRZ کوڈ (P<) نہیں ملا');
  }

  let bestResult: any = null;
  let bestPair: string[] = [];
  let secondBestResult: any = null;
  let secondBestPair: string[] = [];

  for (const pair of candidatePairs) {
    try {
      const parsed = parseMRZ(pair);
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

  let passportNo = '';
  let firstName = '';
  let lastName = '';
  let birthDate = '';
  let expiryDate = '';
  let nationality = '';
  let sex = '';

  if (chosenResult?.fields) {
    const f = chosenResult.fields;
    passportNo = (f.documentNumber || '').replace(/</g, '').trim().toUpperCase();
    firstName = (f.firstName || '').replace(/</g, ' ').trim().toUpperCase();
    lastName = (f.lastName || '').replace(/</g, ' ').trim().toUpperCase();
    birthDate = formatMRZDate(f.birthDate, false);
    expiryDate = formatMRZDate(f.expirationDate || f.expiryDate, true);
    nationality = (f.nationality || f.issuingState || '').replace(/</g, '').trim().toUpperCase();
    sex = (f.sex || '').toUpperCase();
  } else {
    const line1 = chosenPair[0];
    const line2 = chosenPair[1];
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
    mrz: chosenPair.join('\n'),
  };
}

export async function extractPassportFromImage(imageInput: string | Buffer): Promise<PassportExtractionResult> {
  let imageSource: any = imageInput;

  if (typeof imageInput === 'string' && imageInput.startsWith('data:')) {
    const base64Data = imageInput.replace(/^data:[^;]+;base64,/, '').trim();
    imageSource = Buffer.from(base64Data, 'base64');
  }

  const { data: { text } } = await Tesseract.recognize(imageSource, 'eng', {
    // @ts-ignore
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
    // @ts-ignore
    psm: 6,
  });
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
