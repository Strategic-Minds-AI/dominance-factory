// Daily follow-up sequence processor — runs on a cron schedule.
// Loads contacts with scheduled follow-ups, sends messages, updates status.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { sendEmail, sendSms, personalize } from '../../shared/communicationsGateway.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    // Service-role auth for scheduled execution
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) return Response.json({ error: 'Auth required' }, { status: 401 });

    const now = new Date().toISOString();

    // Load contacts with scheduled follow-ups that are due
    const { items: dueContacts } = await base44.asServiceRole.entities.CrmContact.filter({
      follow_up_status: 'scheduled',
      follow_up_at: { $lte: now },
    }, { limit: 100 });

    if (!dueContacts.length) {
      return Response.json({ processed: 0, message: 'No due follow-ups' });
    }

    let sent = 0, failed = 0;
    const results: any[] = [];

    // Process in batches of 6
    for (let i = 0; i < dueContacts.length; i += 6) {
      const batch = dueContacts.slice(i, i + 6);
      const batchResults = await Promise.allSettled(batch.map(async (contact) => {
        const channel = contact.follow_up_subject?.includes('@') || contact.email ? 'email' : 'sms';

        if (channel === 'email' && contact.email) {
          const subject = contact.follow_up_subject || 'Following up';
          const body = contact.follow_up_body || `Hi {{first_name}}, just following up on our previous conversation.`;
          const personalized = personalize(body, contact);
          const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">${personalized.replace(/\n/g, '<br>')}</div>`;
          const res = await sendEmail({ to: contact.email, subject, html });
          return { contact_id: contact.id, channel: 'email', status: 'sent', id: res.id };
        } else if (contact.phone) {
          // SMS follow-up — requires a from_number
          const body = contact.follow_up_body || `Hi {{first_name}}, following up.`;
          const personalized = personalize(body, contact);
          // Use a default from number if configured — for now, skip if no number
          throw new Error('SMS follow-up requires from_number configuration');
        }
        throw new Error('No email or phone for contact');
      }));

      for (let j = 0; j < batchResults.length; j++) {
        const r = batchResults[j];
        if (r.status === 'fulfilled') {
          sent++;
          results.push(r.value);
          // Update contact: mark as sent, schedule next or pause
          const contact = dueContacts[i + j];
          await base44.asServiceRole.entities.CrmContact.update(contact.id, {
            follow_up_status: 'sent',
            last_sent_at: now,
          });
        } else {
          failed++;
          results.push({ error: r.reason?.message || 'Failed' });
          const contact = dueContacts[i + j];
          await base44.asServiceRole.entities.CrmContact.update(contact.id, {
            follow_up_status: 'failed',
          }).catch(() => {});
        }
      }
    }

    return Response.json({ processed: dueContacts.length, sent, failed, results: results.slice(0, 20) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}