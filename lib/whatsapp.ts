import { db } from './db';
import { whatsapp_logs } from './db/schema';

export interface WhatsAppMessageParams {
  agencyId: string;
  recipientPhone: string;
  messageType: 'receipt' | 'visa_update' | 'daily_summary' | 'passport_alert' | 'general';
  message: string;
  mediaUrl?: string;
}

export async function sendWhatsAppMessage(params: WhatsAppMessageParams) {
  const { agencyId, recipientPhone, messageType, message } = params;

  // Clean phone number (e.g. +923001234567 or 03001234567 -> 923001234567)
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');

  let status = 'sent';

  try {
    // If Meta WhatsApp Cloud API credentials are configured in environment
    if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: { body: message },
          }),
        }
      );

      if (!response.ok) {
        status = 'failed';
        console.warn('Meta WhatsApp API call returned non-200, logged status.');
      }
    }
  } catch (error) {
    console.error('WhatsApp dispatch error:', error);
    status = 'logged';
  }

  // Always log to whatsapp_logs table for audit & dashboard viewing
  try {
    await db.insert(whatsapp_logs).values({
      agency_id: agencyId,
      recipient_phone: cleanPhone,
      message_type: messageType,
      message,
      status,
    });
  } catch (dbErr) {
    console.error('Error recording WhatsApp log:', dbErr);
  }

  return { success: true, status, recipient: cleanPhone };
}
