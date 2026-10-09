import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, RotateCcw } from 'lucide-react';
import { stepTitle } from '@/components/pipeline/pipelineSteps';
export default function PipelineControls({ pipeline }) {
  const { run, busy, act } = pipeline; if (!run) return null;
  const running = run.status === 'running'; const runnable = ['queued','manual','failed'].includes(run.status) && ['research','benchmark','simulate','designs','draft'].includes(run.current_step);
  return <div className="space-y-4"><div role="status" className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3"><span className="text-sm font-semibold">{run.mode === 'autonomous' ? 'Autonomous mode' : 'Manual mode'}</span><span className="text-xs text-muted-foreground">{run.status.replace(/_/g, ' ')} · {stepTitle(run.current_step)}</span>{running && <Loader2 className="h-4 w-4 animate-spin" />}</div>
    {run.error && <p role="alert" className="rounded-lg border border-border p-3 text-sm">{run.error}</p>}
    <div className="flex flex-wrap gap-3">{runnable && <Button disabled={busy} onClick={() => act('advance')}>{busy ? <Loader2 className="animate-spin" /> : <Play />} Run {stepTitle(run.current_step)} Now</Button>}{['queued','running','manual'].includes(run.status) && <Button disabled={busy || run.pause_requested} variant="outline" onClick={() => act('pause')}><Pause /> {run.pause_requested ? 'Pausing after this stage' : 'Pause'}</Button>}{['paused','failed'].includes(run.status) && <Button disabled={busy} variant="outline" onClick={() => act('resume')}><RotateCcw /> Resume / Retry</Button>}{run.status === 'needs_evidence' && <Button disabled={busy} variant="outline" onClick={() => act('design_only')}>Continue With Designs Only, No Forecast</Button>}{running && run.lease_until < new Date().toISOString() && <Button disabled={busy} variant="outline" onClick={() => act('resume')}>Recover Interrupted Stage</Button>}</div>
    {run.mode === 'autonomous' && run.status === 'queued' && <p className="text-xs text-muted-foreground">The background stage is queued. Automation requires an available worker; if it cannot run, use “Run Now” without losing your saved context. Approvals and missing-evidence gates cannot be bypassed.</p>}
  </div>;
}