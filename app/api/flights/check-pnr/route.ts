import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pnr_checks, pilgrims, tickets } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = await db
      .select()
      .from(pnr_checks)
      .orderBy(desc(pnr_checks.created_at))
      .limit(20);

    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pnr, airline, haji_id } = body;

    if (!pnr) {
      return NextResponse.json({ error: 'PNR نمبر درج کریں' }, { status: 400 });
    }

    const cleanPnr = pnr.trim().toUpperCase();
    const selectedAirline = airline || 'Saudia Airlines';

    // Mock flight status response for MVP
    const mockResult = {
      pnr: cleanPnr,
      airline: selectedAirline,
      flight: selectedAirline.includes('PIA') ? 'PK-739' : selectedAirline.includes('Saudia') ? 'SV-734' : 'EK-622',
      status: 'Confirmed',
      departure_time: '15:30',
      arrival_time: '19:45',
      terminal: 'Terminal 1 / Hajj Terminal',
      sector: 'Lahore (LHE) -> Jeddah (JED)',
      gate: 'G-14',
      baggage: '2 Pcs x 23kg + 7kg Hand carry',
      seat_confirmed: true,
      passengers: [
        { name: 'MUHAMMAD TARIQ', status: 'OK / Confirmed' },
        { name: 'FATIMA TARIQ', status: 'OK / Confirmed' },
      ],
    };

    // Save to pnr_checks table
    const [savedRecord] = await db
      .insert(pnr_checks)
      .values({
        haji_id: haji_id || null,
        pnr: cleanPnr,
        airline: selectedAirline,
        last_status: JSON.stringify(mockResult),
        last_checked_at: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: mockResult,
      record: savedRecord,
    });
  } catch (error: any) {
    console.error('PNR check error:', error);
    return NextResponse.json(
      { error: 'PNR چیک کرنے میں خرابی پیش آگئی: ' + (error?.message || 'نامعلوم خرابی') },
      { status: 500 }
    );
  }
}
