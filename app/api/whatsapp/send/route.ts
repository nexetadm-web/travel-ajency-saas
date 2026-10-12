import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientPhone, messageType, message, mediaUrl } = body;

    if (!recipientPhone || !message) {
      return NextResponse.json({ error: 'فون نمبر اور پیغام لازمی ہیں' }, { status: 400 });
    }

    const res = await sendWhatsAppMessage({
      agencyId: session.agency_id,
      recipientPhone,
      messageType: messageType || 'general',
      message,
      mediaUrl,
    });

    return NextResponse.json({ ...res, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'پیغام بھیجنے میں خرابی', details: error.message }, { status: 500 });
  }
}
