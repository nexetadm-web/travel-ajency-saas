import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { passport_scans } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { extractPassportFromImage } from '@/lib/services/passportService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';

    let base64Image = '';
    let fileName = 'passport.jpg';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      base64Image = body.image || '';
      if (body.fileName) fileName = body.fileName;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
        fileName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        base64Image = Buffer.from(arrayBuffer).toString('base64');
      }
    }

    if (!base64Image) {
      return NextResponse.json(
        { error: 'براہ کرم پاسپورٹ کی تصویر فراہم کریں (Image is required)' },
        { status: 400 }
      );
    }

    // Extract real data using MRZ OCR
    const extractedData = await extractPassportFromImage(base64Image);

    // Save scan to passport_scans table
    const scanId = crypto.randomUUID();
    try {
      await db.insert(passport_scans).values({
        id: scanId,
        agency_id: agencyId,
        full_name: extractedData.full_name,
        father_name: extractedData.father_name,
        passport_no: extractedData.passport_no,
        cnic: extractedData.cnic,
        dob: extractedData.dob,
        expiry: extractedData.expiry,
        place_of_birth: extractedData.place_of_birth,
        photo_url: '',
        raw_response: JSON.stringify(extractedData),
      });
    } catch (dbErr) {
      console.warn('Could not save passport scan to history DB:', dbErr);
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      scanId,
    });
  } catch (err: any) {
    console.error('Passport scan error:', err);
    return NextResponse.json({ error: err.message || 'اسکین میں خرابی ہوئی' }, { status: 500 });
  }
}
