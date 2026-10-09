import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { advanceRun } from '../../shared/pipelineRunner.ts';
export default async function(req) {
  try {
    const client = createClientFromRequest(req); const user = await client.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    if (typeof body.run_id !== 'string' || typeof body.expected_step !== 'string') return Response.json({ error: 'Run and expected step are required.' }, { status: 400 });
    const run = await client.entities.PipelineRun.get(body.run_id);
    if (!run || run.mode !== 'autonomous' || run.status !== 'queued' || run.pause_requested) return Response.json({ skipped: true });
    return Response.json(await advanceRun(client, run.id, body.expected_step));
  } catch (error) { return Response.json({ error: String(error.message).slice(0, 600) }, { status: 500 }); }
}