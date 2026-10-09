import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { backupToGoogle } from "../../shared/automationEngine.ts";

// Google Backup — backs up generated content (Packs) to Google Drive and
// campaign progress (LaunchCampaigns, SocialPosts, GeneratedPages) to Google Sheets.
// Can be called directly or via cronRunner.

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || new URL(req.url).searchParams.get('token') || '';
    const expectedToken = secrets.get('PACK_SYNC_TOKEN');
    if (!expectedToken || token !== expectedToken) {
      return Response.json({ error: 'Invalid or missing token' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    const result = await backupToGoogle(base44);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}