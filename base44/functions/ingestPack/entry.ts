import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Validate sync token
    const token = secrets.get("PACK_SYNC_TOKEN");
    if (!token) {
      return Response.json({ error: 'Server not configured: PACK_SYNC_TOKEN missing' }, { status: 500 });
    }
    if (!body.sync_token || body.sync_token !== token) {
      return Response.json({ error: 'Invalid sync token' }, { status: 401 });
    }

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return Response.json({ error: 'name is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const pack = await base44.asServiceRole.entities.Pack.create({
      name: body.name,
      kind: body.kind || 'web_pack',
      preview_html: body.preview_html || '',
      brand_tokens: body.brand_tokens || '',
      source: body.source || 'gpt_sync',
      submitted_by_label: body.submitted_by_label || 'GPT',
      status: 'pending_review',
      metadata: body.metadata || '',
    });

    return Response.json({
      ok: true,
      pack_id: pack.id,
      status: 'pending_review',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}