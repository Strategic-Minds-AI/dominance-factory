import React from 'react';
import { Link } from 'react-router-dom';
import PipelineResearch from '@/components/pipeline/PipelineResearch';
import PipelineSimulation from '@/components/pipeline/PipelineSimulation';
import ConceptGallery from '@/components/pipeline/ConceptGallery';
import PipelineDrafts from '@/components/pipeline/PipelineDrafts';
export default function PipelineStageContent({ selected, pipeline }) {
  const { outputs, run, previews, act, busy } = pipeline; const output = outputs[selected];
  if (selected === 'vision' && run) { const profile = JSON.parse(run.profile); return <dl className="grid gap-4 sm:grid-cols-2">{Object.entries(profile).map(([key, value]) => <div key={key}><dt className="text-xs capitalize text-muted-foreground">{key.replace(/_/g, ' ')}</dt><dd className="mt-1 break-words text-sm">{typeof value === 'boolean' ? value ? 'Consented' : 'Not consented' : value || 'Not provided'}</dd></div>)}</dl>; }
  if (selected === 'research' && output) return <PipelineResearch output={output} />;
  if (selected === 'simulate' && output) return <PipelineSimulation output={output} />;
  if (['designs','approval'].includes(selected) && outputs.designs) return <ConceptGallery designs={outputs.designs.designs} previews={previews} selected={run?.selected_design} canApprove={run?.current_step === 'approval' && run.status === 'awaiting_approval'} busy={busy} onApprove={index => act('approve', { design_index: index })} />;
  if (selected === 'draft' && outputs.draft) return <PipelineDrafts outputs={outputs} draft={outputs.draft} />;
  if (['release','social','operate'].includes(selected)) return <div className="space-y-4"><h3 className="font-semibold">Not Enabled For Automatic Release</h3><p className="text-sm text-muted-foreground">{outputs.draft?.release_blockers?.join(' · ') || 'Deployment, independent release checks, social permissions, payment installation and scoped 24/7 workers are still required. This stage cannot claim completion or spend money.'}</p><div className="flex flex-wrap gap-3 text-sm text-foreground"><Link className="underline" to="/backend/provisioning">Provisioning Tools</Link><Link className="underline" to="/backend/social-automation">Social Tools</Link><Link className="underline" to="/backend/agents">Agent Library</Link></div></div>;
  if (output) return <div className="space-y-4"><p className="text-sm">{output.summary}</p>{output.comparisons?.map((c, i) => <article key={i} className="rounded-lg border border-border p-3"><h3 className="text-sm font-semibold">{c.name}</h3><p className="mt-2 text-xs text-muted-foreground">{c.differentiation_opportunity}</p><ul className="mt-2 space-y-1 text-xs">{c.public_features?.map((f, j) => <li key={j}>• {f}</li>)}</ul></article>)}{output.website_requirements?.map((r, i) => <p key={i} className="text-sm">• {r}</p>)}</div>;
  return <p className="text-sm text-muted-foreground">No saved output yet. Each stage consumes the saved answers and outputs from the stages before it; future stages cannot skip their prerequisites.</p>;
}