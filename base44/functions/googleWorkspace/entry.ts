import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Google Workspace Hub — handles all 6 Google services via OAuth connectors.
// Uses SHARED connector tokens (builder's account). No Base44 integration credits consumed.
// Services: gmail, drive, sheets, docs, calendar, tasks, backup, status

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildRawEmail(to: string, subject: string, htmlBody: string): string {
  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody
  ].join('\r\n');
  return base64UrlEncode(email);
}

async function getToken(base44: any, type: string) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection(type);
  return accessToken;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { service, action } = body;

    // ── STATUS: check all 6 connections ──
    if (service === 'status') {
      const services = ['gmail', 'googledrive', 'googlecalendar', 'googlesheets', 'googledocs', 'googletasks'];
      const results: any = {};
      await Promise.allSettled(services.map(async (svc) => {
        try {
          const token = await getToken(base44, svc);
          results[svc] = { connected: true };
        } catch (e: any) {
          results[svc] = { connected: false, error: e.message };
        }
      }));
      return Response.json({ services: results });
    }

    // ── GMAIL ──
    if (service === 'gmail') {
      const token = await getToken(base44, 'gmail');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      if (action === 'send') {
        const { to, subject, html } = body;
        if (!to || !subject) return Response.json({ error: 'to and subject required' }, { status: 400 });
        const raw = buildRawEmail(to, subject, html || `<p>${subject}</p>`);
        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST', headers, body: JSON.stringify({ raw }), signal: AbortSignal.timeout(30000),
        });
        if (!res.ok) return Response.json({ error: `Gmail send ${res.status}: ${(await res.text()).substring(0, 400)}` }, { status: 502 });
        const data = await res.json();
        return Response.json({ status: 'sent', message_id: data.id, provider: 'gmail' });
      }

      if (action === 'list') {
        const { q, max } = body;
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q || '')}&maxResults=${max || 10}`;
        const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
        if (!res.ok) return Response.json({ error: `Gmail list ${res.status}` }, { status: 502 });
        const data = await res.json();
        const msgIds = (data.messages || []).slice(0, max || 10);
        const msgResults = await Promise.allSettled(msgIds.map(async (msg: any) => {
          const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
            headers, signal: AbortSignal.timeout(10000),
          });
          if (!r.ok) return null;
          const d = await r.json();
          const hdrs = d.payload?.headers || [];
          return {
            id: msg.id, threadId: msg.threadId,
            subject: hdrs.find((h: any) => h.name === 'Subject')?.value || '(no subject)',
            from: hdrs.find((h: any) => h.name === 'From')?.value || '',
            date: hdrs.find((h: any) => h.name === 'Date')?.value || '',
            snippet: d.snippet,
          };
        }));
        const messages = msgResults.filter(r => r.status === 'fulfilled' && r.value).map((r: any) => r.value);
        return Response.json({ messages, provider: 'gmail' });
      }

      if (action === 'read') {
        const { message_id } = body;
        if (!message_id) return Response.json({ error: 'message_id required' }, { status: 400 });
        const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message_id}?format=full`, {
          headers, signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return Response.json({ error: `Gmail read ${res.status}` }, { status: 502 });
        const data = await res.json();
        const hdrs = data.payload?.headers || [];
        let bodyText = '';
        if (data.payload?.body?.data) {
          bodyText = atob(data.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (data.payload?.parts) {
          for (const part of data.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              bodyText = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
              break;
            }
            if (part.mimeType === 'text/html' && part.body?.data && !bodyText) {
              bodyText = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }
          }
        }
        return Response.json({
          id: data.id,
          subject: hdrs.find((h: any) => h.name === 'Subject')?.value || '',
          from: hdrs.find((h: any) => h.name === 'From')?.value || '',
          to: hdrs.find((h: any) => h.name === 'To')?.value || '',
          date: hdrs.find((h: any) => h.name === 'Date')?.value || '',
          body: bodyText, provider: 'gmail',
        });
      }
    }

    // ── DRIVE ──
    if (service === 'drive') {
      const token = await getToken(base44, 'googledrive');
      const headers = { Authorization: `Bearer ${token}` };

      if (action === 'list') {
        const { max } = body;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("trashed = false")}&pageSize=${max || 20}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)`;
        const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
        if (!res.ok) return Response.json({ error: `Drive list ${res.status}` }, { status: 502 });
        const data = await res.json();
        return Response.json({ files: data.files || [], provider: 'googledrive' });
      }

      if (action === 'create_folder') {
        const { name, parent_id } = body;
        if (!name) return Response.json({ error: 'name required' }, { status: 400 });
        const folderBody: any = { name, mimeType: 'application/vnd.google-apps.folder' };
        if (parent_id) folderBody.parents = [parent_id];
        const res = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(folderBody), signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return Response.json({ error: `Drive folder ${res.status}` }, { status: 502 });
        const data = await res.json();
        return Response.json({ status: 'folder_created', id: data.id, name, provider: 'googledrive' });
      }

      if (action === 'upload') {
        const { name, content, content_type, parent_id } = body;
        if (!name || !content) return Response.json({ error: 'name and content required' }, { status: 400 });
        const boundary = 'apexforge_' + Date.now();
        const metadata: any = { name };
        if (parent_id) metadata.parents = [parent_id];
        const multipart = [
          `--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '', JSON.stringify(metadata),
          `--${boundary}`, `Content-Type: ${content_type || 'text/plain'}`, '', content, `--${boundary}--`,
        ].join('\r\n');
        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST', headers: { ...headers, 'Content-Type': `multipart/related; boundary=${boundary}` },
          body: multipart, signal: AbortSignal.timeout(30000),
        });
        if (!res.ok) return Response.json({ error: `Drive upload ${res.status}: ${(await res.text()).substring(0, 300)}` }, { status: 502 });
        const data = await res.json();
        return Response.json({ status: 'uploaded', id: data.id, name, provider: 'googledrive' });
      }
    }

    // ── SHEETS ──
    if (service === 'sheets') {
      const token = await getToken(base44, 'googlesheets');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      if (action === 'create') {
        const { title } = body;
        if (!title) return Response.json({ error: 'title required' }, { status: 400 });
        const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST', headers, body: JSON.stringify({ properties: { title } }), signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return Response.json({ error: `Sheets create ${res.status}` }, { status: 502 });
        const data = await res.json();
        return Response.json({ status: 'created', spreadsheet_id: data.spreadsheetId, url: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`, provider: 'googlesheets' });
      }

      if (action === 'append') {
        const { spreadsheet_id, range, values } = body;
        if (!spreadsheet_id || !values) return Response.json({ error: 'spreadsheet_id and values required' }, { status: 400 });
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range || 'A1'}:append?valueInputOption=RAW`, {
          method: 'POST', headers, body: JSON.stringify({ values }), signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return Response.json({ error: `Sheets append ${res.status}` }, { status: 502 });
        const data = await res.json();
        return Response.json({ status: 'appended', updated_cells: data.updates?.updatedCells, provider: 'googlesheets' });
      }

      if (action === 'read') {
        const { spreadsheet_id, range } = body;
        if (!spreadsheet_id) return Response.json({ error: 'spreadsheet_id required' }, { status: 400 });
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range || 'A1:Z1000'}`, {
          headers, signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return Response.json({ error: `Sheets read ${res.status}` }, { status: 502 });
        const data = await res.json();
        return Response.json({ values: data.values || [], provider: 'googlesheets' });
      }
    }

    // ── DOCS ──
    if (service === 'docs') {
      const token = await getToken(base44, 'googledocs');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      if (action === 'create') {
        const { title } = body;
        if (!title) return Response.json({ error: 'title required' }, { status: 400 });
        const res = await fetch('https://docs.googleapis.com/v1/documents', {
          method: 'POST', headers, body: JSON.stringify({ title }), signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return Response.json({ error: `Docs create ${res.status}` }, { status: 502 });
        const data = await res.json();
        return Response.json({ status: 'created', document_id: data.documentId, url: `https://docs.google.com/document/d/${data.documentId}/edit`, provider: 'googledocs' });
      }

      if (action === 'write') {
        const { document_id, content } = body;
        if (!document_id || !content) return Response.json({ error: 'document_id and content required' }, { status: 400 });
        const res = await fetch(`https://docs.googleapis.com/v1/documents/${document_id}:batchUpdate`, {
          method: 'POST', headers, body: JSON.stringify({ requests: [{ insertText: { location: { index: 1 }, text: content } }] }),
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return Response.json({ error: `Docs write ${res.status}` }, { status: 502 });
        return Response.json({ status: 'written', document_id, provider: 'googledocs' });
      }
    }

    // ── CALENDAR ──
    if (service === 'calendar') {
      const token = await getToken(base44, 'googlecalendar');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      if (action === 'create') {
        const { summary, description, start, end, attendees } = body;
        if (!summary || !start) return Response.json({ error: 'summary and start required' }, { status: 400 });
        const eventBody: any = {
          summary, description: description || '',
          start: { dateTime: start, timeZone: 'America/New_York' },
          end: { dateTime: end || start, timeZone: 'America/New_York' },
        };
        if (attendees?.length) eventBody.attendees = attendees.map((a: string) => ({ email: a }));
        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST', headers, body: JSON.stringify(eventBody), signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return Response.json({ error: `Calendar create ${res.status}: ${(await res.text()).substring(0, 300)}` }, { status: 502 });
        const data = await res.json();
        return Response.json({ status: 'created', event_id: data.id, html_link: data.htmlLink, provider: 'googlecalendar' });
      }

      if (action === 'list') {
        const { max } = body;
        const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${max || 10}&timeMin=${encodeURIComponent(new Date().toISOString())}&orderBy=startTime&singleEvents=true`;
        const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
        if (!res.ok) return Response.json({ error: `Calendar list ${res.status}` }, { status: 502 });
        const data = await res.json();
        const events = (data.items || []).map((e: any) => ({
          id: e.id, summary: e.summary || '(no title)',
          start: e.start?.dateTime || e.start?.date, end: e.end?.dateTime || e.end?.date,
          html_link: e.htmlLink,
        }));
        return Response.json({ events, provider: 'googlecalendar' });
      }
    }

    // ── TASKS ──
    if (service === 'tasks') {
      const token = await getToken(base44, 'googletasks');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      if (action === 'create') {
        const { title, notes, due } = body;
        if (!title) return Response.json({ error: 'title required' }, { status: 400 });
        const taskBody: any = { title, notes: notes || '' };
        if (due) taskBody.due = due;
        const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
          method: 'POST', headers, body: JSON.stringify(taskBody), signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return Response.json({ error: `Tasks create ${res.status}` }, { status: 502 });
        const data = await res.json();
        return Response.json({ status: 'created', task_id: data.id, title, provider: 'googletasks' });
      }

      if (action === 'list') {
        const { show_completed } = body;
        const url = `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?maxResults=50&showCompleted=${show_completed || false}`;
        const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
        if (!res.ok) return Response.json({ error: `Tasks list ${res.status}` }, { status: 502 });
        const data = await res.json();
        const tasks = (data.items || []).map((t: any) => ({ id: t.id, title: t.title, notes: t.notes, status: t.status, due: t.due }));
        return Response.json({ tasks, provider: 'googletasks' });
      }

      if (action === 'complete') {
        const { task_id } = body;
        if (!task_id) return Response.json({ error: 'task_id required' }, { status: 400 });
        const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${task_id}`, {
          method: 'PATCH', headers, body: JSON.stringify({ status: 'completed' }), signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return Response.json({ error: `Tasks complete ${res.status}` }, { status: 502 });
        return Response.json({ status: 'completed', task_id, provider: 'googletasks' });
      }
    }

    // ── BACKUP: export entity data to Google Sheets or Docs ──
    if (service === 'backup') {
      if (action === 'entity_to_sheets') {
        const { entity_name } = body;
        if (!entity_name) return Response.json({ error: 'entity_name required' }, { status: 400 });
        const entityApi = (base44.asServiceRole.entities as any)[entity_name];
        if (!entityApi) return Response.json({ error: `Entity ${entity_name} not found` }, { status: 400 });
        const page = await entityApi.list({ limit: 500 });
        const records = page.items || page;
        if (!records?.length) return Response.json({ error: `No records in ${entity_name}` }, { status: 400 });

        const fieldNames = Object.keys(records[0]).filter(k => !k.startsWith('_'));
        const values = [fieldNames, ...records.map((r: any) => fieldNames.map(f => {
          const v = r[f];
          if (v === null || v === undefined) return '';
          if (typeof v === 'object') return JSON.stringify(v);
          return String(v);
        }))];

        const token = await getToken(base44, 'googlesheets');
        const sHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        const ts = new Date().toISOString().split('T')[0];
        const title = `ApexForge Backup - ${entity_name} - ${ts}`;
        const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST', headers: sHeaders, body: JSON.stringify({ properties: { title } }), signal: AbortSignal.timeout(15000),
        });
        if (!createRes.ok) return Response.json({ error: `Sheets create ${createRes.status}` }, { status: 502 });
        const sheetData = await createRes.json();
        const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetData.spreadsheetId}/values/A1:append?valueInputOption=RAW`, {
          method: 'POST', headers: sHeaders, body: JSON.stringify({ values }), signal: AbortSignal.timeout(30000),
        });
        if (!appendRes.ok) return Response.json({ error: `Sheets append ${appendRes.status}` }, { status: 502 });
        return Response.json({
          status: 'backed_up', entity: entity_name, record_count: records.length,
          spreadsheet_id: sheetData.spreadsheetId, spreadsheet_url: `https://docs.google.com/spreadsheets/d/${sheetData.spreadsheetId}/edit`,
          provider: 'googlesheets',
        });
      }

      if (action === 'entity_to_doc') {
        const { entity_name } = body;
        if (!entity_name) return Response.json({ error: 'entity_name required' }, { status: 400 });
        const entityApi = (base44.asServiceRole.entities as any)[entity_name];
        if (!entityApi) return Response.json({ error: `Entity ${entity_name} not found` }, { status: 400 });
        const page = await entityApi.list({ limit: 100 });
        const records = page.items || page;
        if (!records?.length) return Response.json({ error: `No records in ${entity_name}` }, { status: 400 });

        const ts = new Date().toISOString();
        let content = `ApexForge Backup Report\n${entity_name} Entity\nGenerated: ${ts}\n\nTotal Records: ${records.length}\n\n${'='.repeat(60)}\n\n`;
        for (let i = 0; i < records.length; i++) {
          content += `Record ${i + 1}:\n`;
          for (const [key, val] of Object.entries(records[i])) {
            if (key.startsWith('_')) continue;
            content += `  ${key}: ${typeof val === 'object' ? JSON.stringify(val) : String(val)}\n`;
          }
          content += `\n${'-'.repeat(40)}\n\n`;
        }

        const token = await getToken(base44, 'googledocs');
        const dHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        const title = `ApexForge Report - ${entity_name} - ${ts.split('T')[0]}`;
        const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
          method: 'POST', headers: dHeaders, body: JSON.stringify({ title }), signal: AbortSignal.timeout(15000),
        });
        if (!createRes.ok) return Response.json({ error: `Docs create ${createRes.status}` }, { status: 502 });
        const docData = await createRes.json();
        const writeRes = await fetch(`https://docs.googleapis.com/v1/documents/${docData.documentId}:batchUpdate`, {
          method: 'POST', headers: dHeaders,
          body: JSON.stringify({ requests: [{ insertText: { location: { index: 1 }, text: content } }] }),
          signal: AbortSignal.timeout(15000),
        });
        if (!writeRes.ok) return Response.json({ error: `Docs write ${writeRes.status}` }, { status: 502 });
        return Response.json({
          status: 'backed_up', entity: entity_name, record_count: records.length,
          document_id: docData.documentId, document_url: `https://docs.google.com/document/d/${docData.documentId}/edit`,
          provider: 'googledocs',
        });
      }
    }

    return Response.json({ error: `Unknown service: ${service}. Use: gmail, drive, sheets, docs, calendar, tasks, backup, status` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}