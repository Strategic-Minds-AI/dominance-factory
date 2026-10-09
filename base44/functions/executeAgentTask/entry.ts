// Dispatches super agent tasks — browser automation, form filling, scraping, outreach.
// Routes each task to the right gateway: cloud browser for web tasks, comms for messaging.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { runBrowserTask, fillForm, scrapePage, isConfigured } from '../../shared/cloudBrowserGateway.ts';
import { sendEmail, sendSms, personalize } from '../../shared/communicationsGateway.ts';
import { aiComplete, MODELS } from '../../shared/vercelAiGateway.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();
    const { task_id, agent_id, task_type, target_url, instructions, contact, template } = body;

    // If task_id provided, load existing AgentTask
    let agentTask = null;
    if (task_id) {
      agentTask = await base44.asServiceRole.entities.AgentTask.get(task_id);
      if (!agentTask) return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    const type = task_type || agentTask?.target_outlet || 'browser';
    await base44.asServiceRole.entities.AgentTask.update(task_id || agentTask?.id, { status: 'in_progress' }).catch(() => {});

    let result: any = {};

    switch (type) {
      case 'browser':
      case 'form_fill':
      case 'scrape': {
        if (!isConfigured()) {
          throw new Error('Cloud browser not configured — provision a browser service first, then set CLOUD_BROWSER_URL');
        }
        if (type === 'form_fill' && target_url && body.fields) {
          result = await fillForm({ url: target_url, fields: body.fields, submitSelector: body.submit_selector });
        } else if (type === 'scrape' && target_url) {
          const extractPrompt = instructions || 'Extract all key information from this page';
          result = await scrapePage({ url: target_url, extractPrompt });
        } else {
          const task = instructions || body.task || `Go to ${target_url || 'the target website'} and complete the assigned task`;
          result = await runBrowserTask(task, { url: target_url, extractData: true, screenshot: true });
        }
        break;
      }

      case 'email': {
        const to = contact?.email || body.to;
        if (!to) throw new Error('Email address required');
        const subj = body.subject || 'Following up';
        const content = template ? personalize(template, contact) : (instructions || 'Hello, reaching out regarding our services.');
        const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">${content.replace(/\n/g, '<br>')}</div>`;
        const res = await sendEmail({ to, subject: subj, html, from: body.from_email || undefined });
        result = { sent: true, id: res.id, to };
        break;
      }

      case 'sms': {
        const to = contact?.phone || body.to;
        if (!to) throw new Error('Phone number required');
        if (!body.from_number) throw new Error('from_number required for SMS');
        const content = template ? personalize(template, contact) : (instructions || 'Hello, following up.');
        const res = await sendSms({ from: body.from_number, to, text: content });
        result = { sent: res.delivered, status: res.status, id: res.id, to };
        break;
      }

      case 'research': {
        const researchResult = await aiComplete({
          model: MODELS.research,
          messages: [{ role: 'user', content: instructions || `Research ${target_url || 'the target'} and provide key findings` }],
          max_tokens: 2048,
        });
        result = { findings: researchResult };
        break;
      }

      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    // Update AgentTask with result
    if (task_id || agentTask?.id) {
      await base44.asServiceRole.entities.AgentTask.update(task_id || agentTask.id, {
        status: 'completed',
        result: JSON.stringify(result).substring(0, 10000),
        completed_at: new Date().toISOString(),
      }).catch(() => {});
    }

    return Response.json({ status: 'completed', type, result });
  } catch (error) {
    // Mark task as failed
    const body = await req.json().catch(() => ({}));
    if (body.task_id) {
      try {
        const base44 = createClientFromRequest(req);
        await base44.asServiceRole.entities.AgentTask.update(body.task_id, {
          status: 'failed',
          result: error.message,
          completed_at: new Date().toISOString(),
        });
      } catch {}
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}