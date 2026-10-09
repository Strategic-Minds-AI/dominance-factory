import { fingerprint } from './pipelineEvidence.ts';
import { performStage, saveArtifact } from './pipelineStages.ts';
export const EXECUTABLE_STEPS = ['research', 'benchmark', 'simulate', 'designs', 'draft'];
const NEXT = { research: 'benchmark', benchmark: 'simulate', simulate: 'designs', designs: 'approval', draft: 'release' };
export async function getContext(client, run) {
  const page = await client.entities.PipelineArtifact.filter({ run_id: run.id, step: { $in: ['research', 'benchmark', 'simulate', 'designs', 'approval', 'draft'] } }, { limit: 10, sort: 'completed_at' });
  const outputs = Object.fromEntries(page.items.map(a => [a.step, JSON.parse(a.output)]));
  return { profile: JSON.parse(run.profile), ...outputs, lineage: page.items.map(a => ({ step: a.step, input_hash: a.input_hash, output_hash: a.output_hash })) };
}
export async function advanceRun(client, runId, expectedStep) {
  let run = await client.entities.PipelineRun.get(runId);
  if (!run || run.current_step !== expectedStep || !EXECUTABLE_STEPS.includes(run.current_step) || !['queued', 'manual', 'failed'].includes(run.status)) return { skipped: true, run };
  const prerequisites = { benchmark: 'research', simulate: 'benchmark', designs: 'simulate', draft: 'approval' };
  const context = await getContext(client, run);
  if (prerequisites[run.current_step] && !context[prerequisites[run.current_step]]) throw new Error('Previous step output is missing; execution refused.');
  const lease = crypto.randomUUID();
  await client.entities.PipelineRun.updateMany({ id: runId, current_step: expectedStep, status: { $in: ['queued', 'manual', 'failed'] } }, { $set: { status: 'running', lease_token: lease, lease_until: new Date(Date.now() + 300000).toISOString(), error: '' } });
  run = await client.entities.PipelineRun.get(runId);
  if (run.lease_token !== lease) return { skipped: true, run };
  try {
    const existing = await client.entities.PipelineArtifact.filter({ run_id: run.id, step: run.current_step }, { limit: 1 });
    const output = existing.items[0] ? JSON.parse(existing.items[0].output) : await performStage(client, run, context);
    if (!existing.items[0]) await saveArtifact(client, run, run.current_step, context, output);
    const latest = await client.entities.PipelineRun.get(runId); const next = NEXT[run.current_step];
    const status = next === 'approval' ? 'awaiting_approval' : next === 'release' ? 'blocked' : latest.pause_requested ? 'paused' : run.mode === 'autonomous' ? 'queued' : 'manual';
    if (latest.lease_token !== lease || latest.status !== 'running') return { skipped: true, run: latest };
    await client.entities.PipelineRun.update(runId, { current_step: next, status, lease_token: '', lease_until: '', error: next === 'release' ? 'Drafts are ready. Deployment, social, payment and 24/7 agent release are not enabled yet.' : '', ...(output.website_id ? { website_id: output.website_id } : {}) });
    return { run: await client.entities.PipelineRun.get(runId), output_hash: await fingerprint(output) };
  } catch (error) {
    const needsEvidence = run.current_step === 'simulate' && String(error.message).startsWith('Evidence required');
    await client.entities.PipelineRun.updateMany({ id: runId, lease_token: lease, status: 'running' }, { $set: { status: needsEvidence ? 'needs_evidence' : 'failed', error: String(error.message).slice(0, 1000), lease_token: '', lease_until: '' } });
    return { run: await client.entities.PipelineRun.get(runId) };
  }
}