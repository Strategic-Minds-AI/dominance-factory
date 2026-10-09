import React from 'react';
import { ExternalLink } from 'lucide-react';
export default function PipelineResearch({ output }) {
  const market = output.market_data;
  return <div className="space-y-5"><p className="text-sm leading-relaxed">{output.summary}</p>
    {output.business_findings?.length > 0 && <ul className="space-y-2 text-sm text-muted-foreground">{output.business_findings.map((f, i) => <li key={i}>• {f}</li>)}</ul>}
    <div className="grid gap-3 sm:grid-cols-3">{market?.evidence?.map(metric => <div key={metric.key} className="rounded-lg border border-border bg-secondary/40 p-3"><p className="text-xs text-muted-foreground">{metric.key === 'lead_value' ? 'Revenue per customer' : metric.key.replace(/_/g, ' ')}</p><p className="mt-2 font-mono text-lg">{metric.value == null ? 'Not verified' : metric.value.toLocaleString()}</p><p className="mt-1 text-xs text-muted-foreground">{metric.status.replace(/_/g, ' ')}</p>{metric.quote && <details className="mt-2 text-xs"><summary className="cursor-pointer">Source quotation</summary><p className="mt-2">{metric.quote}</p><p>{metric.period} · {metric.geography}</p></details>}</div>)}</div>
    {output.sources?.length > 0 && <div><h3 className="mb-2 text-sm font-semibold">Source References</h3><ul className="space-y-2">{output.sources.map((source, i) => <li key={i} className="text-xs"><a className="inline-flex items-center gap-2 text-foreground underline underline-offset-4" href={source.url} target="_blank" rel="noopener noreferrer">{source.title || source.url}<ExternalLink className="h-3 w-3" /></a><span className="ml-2 text-muted-foreground">{source.status?.replace(/_/g, ' ')}</span></li>)}</ul></div>}
    <p className="text-xs text-muted-foreground">{output.observed_at && `Retrieved ${new Date(output.observed_at).toLocaleString()}. `}References are not automatically verified measurements. Missing metrics remain unknown.</p>
  </div>;
}