// Sends outreach messages via Email (Resend) or SMS/MMS (Telnyx).
// Processes an OutreachCampaign: loads targets, personalizes, sends, tracks results.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { sendEmail, sendSms, sendMms, personalize } from '../../shared/communicationsGateway.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();
    const { campaign_id, channel, template, subject, from_number, from_email, media_url, target_emails, target_phones, batch_size } = body;

    let campaign = null;
    if (campaign_id) {
      campaign = await base44.asServiceRole.entities.OutreachCampaign.get(campaign_id);
      if (!campaign) return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const ch = channel || campaign?.channel || 'email';
    const tpl = template || campaign?.template || '';
    const subj = subject || campaign?.subject || 'Following up';
    const fromNum = from_number || campaign?.from_number || '';
    const fromEmail = from_email || campaign?.from_email || '';
    const mediaUrl = media_url || campaign?.media_url || '';
    const batchSize = Math.min(batch_size || 50, 100);

    // Load targets — either from explicit arrays or from Lead entity
    let targets: any[] = [];
    if (ch === 'email' && target_emails?.length) {
      targets = target_emails.map((e: string) => ({ email: e, name: e.split('@')[0] }));
    } else if (ch !== 'email' && target_phones?.length) {
      targets = target_phones.map((p: string) => ({ phone: p, name: 'there' }));
    } else {
      // Load from Lead entity
      const leadQuery = ch === 'email' ? { email: { $exists: true } } : {};
      const { items } = await base44.asServiceRole.entities.Lead.filter(leadQuery, { limit: batchSize });
      targets = items;
    }

    if (!targets.length) return Response.json({ error: 'No targets found' }, { status: 400 });

    let sent = 0, failed = 0;
    const results: any[] = [];

    // Send in batches of 6 (connection limit)
    for (let i = 0; i < targets.length; i += 6) {
      const batch = targets.slice(i, i + 6);
      const batchResults = await Promise.allSettled(batch.map(async (target) => {
        const personalized = personalize(tpl, target);
        if (ch === 'email') {
          const to = target.email;
          if (!to) throw new Error('No email');
          const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">${personalized.replace(/\n/g, '<br>')}</div>`;
          const res = await sendEmail({ to, subject: subj, html, from: fromEmail || undefined });
          return { to, status: 'sent', id: res.id };
        } else {
          const to = target.phone;
          if (!to) throw new Error('No phone');
          if (!fromNum) throw new Error('from_number required for SMS/MMS');
          if (ch === 'mms' && mediaUrl) {
            const res = await sendMms({ from: fromNum, to, text: personalized, media_urls: [mediaUrl] });
            return { to, status: res.delivered ? 'sent' : 'failed', id: res.id };
          }
          const res = await sendSms({ from: fromNum, to, text: personalized });
          return { to, status: res.delivered ? 'sent' : 'failed', id: res.id };
        }
      }));

      for (const r of batchResults) {
        if (r.status === 'fulfilled') { sent++; results.push(r.value); }
        else { failed++; results.push({ error: r.reason?.message || 'Failed' }); }
      }
    }

    // Update campaign if provided
    if (campaign) {
      await base44.asServiceRole.entities.OutreachCampaign.update(campaign_id, {
        sent_count: (campaign.sent_count || 0) + sent,
        failed_count: (campaign.failed_count || 0) + failed,
        status: sent + failed >= targets.length ? 'completed' : 'running',
        completed_at: sent + failed >= targets.length ? new Date().toISOString() : undefined,
      });
    }

    return Response.json({ sent, failed, total: targets.length, results: results.slice(0, 20) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}