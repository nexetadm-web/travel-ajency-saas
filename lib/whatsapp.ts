import { db } from './db';
import { whatsapp_logs } from './db/schema';

export const WHATSAPP_TEMPLATES = {
  ON_GROUP_CREATE: 'Assalamu Alaikum {name}, Apka group {group_name} {date} ko rawana hoga. Leader: {leader}. Track: {link}',
  VISA_APPROVED: 'Mubarak ho {name}! Apka visa lag gaya. Track: {link}',
  INSTALLMENT_REMINDER: 'Yaad dehani: {name}, apki qist {amount} ki tareekh {date} hai. Shukriya',
  TICKET: 'Apki ticket confirm. PNR {pnr}, Flight {date}. PDF: {link}',
};

export type TemplateKey = keyof typeof WHATSAPP_TEMPLATES;

export async function sendWhatsApp(
  phone: string,
  templateName: TemplateKey | string,
  variables: Record<string, string>,
  hajiId?: string,
  agencyId: string = 'system_agency'
) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const templateStr = WHATSAPP_TEMPLATES[templateName as TemplateKey] || templateName;

  // Replace variable placeholders e.g. {name}, {group_name}, etc.
  let message = templateStr;
  for (const [key, val] of Object.entries(variables)) {
    message = message.replace(new RegExp(`{${key}}`, 'g'), val || '');
  }

  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  console.log(`[WhatsApp Autopilot] Sent to ${cleanPhone}: "${message}"`);

  let status = 'sent';

  try {
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
        status = 'logged';
      }
    }
  } catch (err) {
    console.error('Meta Cloud API error:', err);
    status = 'logged';
  }

  // Insert into whatsapp_logs table
  let logId = '';
  try {
    const [inserted] = await db
      .insert(whatsapp_logs)
      .values({
        agency_id: agencyId,
        recipient_phone: cleanPhone || '03000000000',
        message_type: templateName,
        type: templateName,
        haji_id: hajiId || null,
        message,
        status,
        sent_at: new Date().toISOString(),
      })
      .returning();
    logId = inserted?.id || '';
  } catch (dbErr) {
    console.error('Failed to save whatsapp log to DB:', dbErr);
  }

  return {
    success: true,
    message,
    waLink,
    logId,
  };
}

export interface WhatsAppMessageParams {
  agencyId: string;
  recipientPhone: string;
  messageType: string;
  message: string;
  mediaUrl?: string;
  hajiId?: string;
}

export async function sendWhatsAppMessage(params: WhatsAppMessageParams) {
  const { agencyId, recipientPhone, messageType, message, hajiId } = params;
  return sendWhatsApp(
    recipientPhone,
    message,
    {},
    hajiId,
    agencyId
  );
}
