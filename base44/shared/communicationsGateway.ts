// Communications Gateway — Email (Resend) + SMS/MMS/WhatsApp (Telnyx)
// All calls bypass Base44 credits and use the user's own provider accounts.
import { secrets } from 'base44:runtime';

// ── Resend Email ──────────────────────────────────────────────
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}): Promise<{ id: string }> {
  const key = secrets.get('RESEND_API_KEY');
  if (!key) throw new Error('RESEND_API_KEY not configured');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: params.from || 'ApexForge <noreply@resend.dev>',
      to: params.to,
      subject: params.subject,
      html: params.html,
      reply_to: params.replyTo,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err.substring(0, 400)}`);
  }
  const data = await res.json();
  return { id: data.id };
}

// ── Telnyx SMS/MMS/WhatsApp ───────────────────────────────────
function getTelnyxKey(): string {
  const key = secrets.get('TELNYX_API_KEY');
  if (!key) throw new Error('TELNYX_API_KEY not configured');
  return key;
}

export async function sendSms(params: {
  from: string;
  to: string;
  text: string;
}): Promise<{ delivered: boolean; status: string; id: string }> {
  const key = getTelnyxKey();
  const res = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: params.from, to: params.to, text: params.text }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telnyx SMS error ${res.status}: ${err.substring(0, 400)}`);
  }
  const data = await res.json();
  const status = data.data?.to?.[0]?.status || 'unknown';
  return { delivered: status === 'delivered' || status === 'sent', status, id: data.data?.id || '' };
}

export async function sendMms(params: {
  from: string;
  to: string;
  text: string;
  media_urls: string[];
}): Promise<{ delivered: boolean; status: string; id: string }> {
  const key = getTelnyxKey();
  const res = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: params.from, to: params.to, text: params.text,
      media_urls: params.media_urls,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telnyx MMS error ${res.status}: ${err.substring(0, 400)}`);
  }
  const data = await res.json();
  const status = data.data?.to?.[0]?.status || 'unknown';
  return { delivered: status === 'delivered' || status === 'sent', status, id: data.data?.id || '' };
}

export async function sendWhatsApp(params: {
  from: string;
  to: string;
  text: string;
}): Promise<{ delivered: boolean; status: string; id: string }> {
  const key = getTelnyxKey();
  const res = await fetch('https://api.telnyx.com/v2/messages/whatsapp', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: params.from, to: params.to,
      whatsapp_message: { text: { body: params.text } },
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telnyx WhatsApp error ${res.status}: ${err.substring(0, 400)}`);
  }
  const data = await res.json();
  const status = data.data?.to?.[0]?.status || 'unknown';
  return { delivered: status === 'delivered' || status === 'sent', status, id: data.data?.id || '' };
}

// ── Template Personalization ─────────────────────────────────
export function personalize(template: string, contact: any): string {
  const firstName = (contact.name || contact.full_name || '').split(' ')[0] || 'there';
  const company = contact.company || contact.business_name || 'your company';
  return template
    .replace(/\{\{first_name\}\}/gi, firstName)
    .replace(/\{\{company\}\}/gi, company)
    .replace(/\{\{email\}\}/gi, contact.email || '')
    .replace(/\{\{phone\}\}/gi, contact.phone || '');
}