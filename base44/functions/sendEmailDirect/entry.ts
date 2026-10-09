import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Direct email sending via Resend API — bypasses Base44 SendEmail integration.
// Uses the user's RESEND_API_KEY secret. No Base44 integration credits consumed.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const apiKey = secrets.get('RESEND_API_KEY');
    if (!apiKey) return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });

    const { to, subject, html, text, from, replyTo, attachments } = body;

    if (!to || !subject) {
      return Response.json({ error: 'to and subject are required' }, { status: 400 });
    }

    const emailBody: any = {
      from: from || 'ApexForge <noreply@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
    };
    if (html) emailBody.html = html;
    if (text) emailBody.text = text;
    if (replyTo) emailBody.reply_to = replyTo;
    if (attachments && Array.isArray(attachments)) emailBody.attachments = attachments;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `Resend API error ${res.status}: ${err.substring(0, 500)}` }, { status: 502 });
    }

    const data = await res.json();
    return Response.json({ status: 'sent', message_id: data.id, provider: 'resend' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}