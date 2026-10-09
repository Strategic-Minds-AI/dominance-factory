import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Workflow } from 'lucide-react';
import usePipeline from '@/components/pipeline/usePipeline';
import { PIPELINE_STEPS } from '@/components/pipeline/pipelineSteps';
import PipelineStepper from '@/components/pipeline/PipelineStepper';
import VisionOnboarding from '@/components/pipeline/VisionOnboarding';
import PipelineStageContent from '@/components/pipeline/PipelineStageContent';
import PipelineControls from '@/components/pipeline/PipelineControls';
import PipelineAudit from '@/components/pipeline/PipelineAudit';
export default function PipelineControl() {
  const pipeline = usePipeline(); const [selected, setSelected] = useState('vision'); const [tab, setTab] = useState('process');
  const { run, outputs, artifacts } = pipeline;
  useEffect(() => { setSelected(run?.current_step || 'vision'); }, [run?.id, run?.current_step]);
  const step = PIPELINE_STEPS.find(s => s.key === selected); const artifact = artifacts.find(a => a.step === selected);
  return <div className="pipeline-surface min-h-screen bg-background p-4 text-foreground sm:p-6"><div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"><Workflow className="h-4 w-4 text-primary" /> ApexForge · Connected Pipeline</p><h1 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">From Vision To A Governed Build</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">One saved business brief. Evidence-backed handoffs. Your design approval before draft generation.</p></div><Button variant="outline" onClick={() => { pipeline.startNew(); setSelected('vision'); setTab('process'); }}><Plus /> New Pipeline</Button></header>
    <PipelineStepper selected={selected} onSelect={key => { setSelected(key); setTab('process'); }} run={run} outputs={outputs} />
    <div className="flex flex-wrap items-center gap-3"><Button variant={tab === 'process' ? 'default' : 'outline'} onClick={() => setTab('process')}>Pipeline Process</Button><Button variant={tab === 'audit' ? 'default' : 'outline'} onClick={() => setTab('audit')}>Source Audit & Gaps</Button>{pipeline.history.length > 0 && <><label htmlFor="pipeline-history" className="sr-only">Saved pipeline</label><select id="pipeline-history" value={run?.id || ''} onChange={e => e.target.value && pipeline.openRun(e.target.value)} className="h-10 max-w-full rounded-md border border-input bg-card px-3 text-sm"><option value="">Saved pipelines</option>{pipeline.history.map(r => <option key={r.id} value={r.id}>{r.name} · {r.status.replace(/_/g, ' ')}</option>)}</select>{pipeline.hasMore && <Button variant="outline" onClick={pipeline.loadMore}>Load More Pipelines</Button>}</>}</div>
    {pipeline.error && <div role="alert" className="rounded-lg border border-border bg-card p-4 text-sm">{pipeline.error}<Button variant="link" onClick={pipeline.retry}>Reload Saved Pipeline</Button></div>}
    {tab === 'audit' ? <PipelineAudit audit={pipeline.audit} /> : <>
      {run && <PipelineControls pipeline={pipeline} />}
      <section aria-labelledby="pipeline-stage-title" className="rounded-xl border border-border bg-card p-5 sm:p-6"><p className="text-xs uppercase tracking-widest text-muted-foreground">{step.phase} · Step {PIPELINE_STEPS.indexOf(step) + 1}</p><h2 id="pipeline-stage-title" className="mt-2 text-xl font-semibold">{step.title === 'Vision' ? 'Vision & AI-Assisted Onboarding' : step.title}</h2><p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
        {pipeline.loading ? <div role="status" className="flex gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved pipeline…</div> : selected === 'vision' && !run ? <VisionOnboarding busy={pipeline.busy} onStart={payload => pipeline.act('start', payload)} /> : <PipelineStageContent selected={selected} pipeline={pipeline} />}
        {artifact && <details className="mt-6 border-t border-border pt-4"><summary className="cursor-pointer text-xs text-muted-foreground">Saved handoff & evidence fingerprints</summary><p className="mt-3 break-all font-mono text-[10px] text-muted-foreground">Input: {artifact.input_hash}<br />Output: {artifact.output_hash}<br />Saved: {new Date(artifact.completed_at).toLocaleString()}</p><pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-secondary p-3 text-xs">{JSON.stringify(outputs[selected], null, 2)}</pre></details>}
      </section>
      <p className="text-xs leading-relaxed text-muted-foreground">Deterministic means repeatable state transitions, frozen handoffs and seeded scenario mathematics. Fresh AI generation and changing market conditions are not deterministic. No system can guarantee Google rankings, followers or wealth.</p>
    </>}
  </div></div>;
}