import { NextRequest, NextResponse } from 'next/server';
import { extractPassportFromImage } from '@/lib/services/passportService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let base64Image = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      base64Image = body.image || '';
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
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

    const extractedData = await extractPassportFromImage(base64Image);

    return NextResponse.json({
      success: true,
      data: extractedData,
      message: 'Passport scanned successfully via MRZ OCR',
    });
  } catch (error: any) {
    console.error('Passport scan API error:', error);
    return NextResponse.json(
      { error: error?.message || 'پاسپورٹ اسکین کرنے میں خرابی پیش آگئی' },
      { status: 500 }
    );
  }
}
