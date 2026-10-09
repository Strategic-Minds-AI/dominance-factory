import React from 'react';
import { Check, Lock, Minus } from 'lucide-react';
import { PIPELINE_STEPS } from '@/components/pipeline/pipelineSteps';
import { cn } from '@/lib/utils';
export default function PipelineStepper({ selected, onSelect, run, outputs }) {
  return <nav aria-label="Full business pipeline" className="rounded-xl border border-border bg-card p-3 sm:p-4"><ol className="grid grid-cols-5 gap-x-2 gap-y-5 xl:grid-cols-10">
    {PIPELINE_STEPS.map((step, i) => { const withheld = step.key === 'simulate' && outputs.simulate?.withheld; const done = step.key === 'vision' ? !!run : !!outputs[step.key]; const gated = i > 6;
      return <li key={step.key}><button type="button" onClick={() => onSelect(step.key)} aria-current={selected === step.key ? 'step' : undefined} className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-full border-2 font-mono text-sm', selected === step.key ? 'border-primary bg-primary text-primary-foreground' : done ? 'border-primary/70 bg-accent text-accent-foreground' : 'border-border bg-secondary text-muted-foreground')}>
          {withheld ? <Minus className="h-4 w-4" /> : done ? <Check className="h-4 w-4" /> : gated ? <Lock className="h-4 w-4" /> : String(i + 1).padStart(2, '0')}
        </span><span className="text-center text-[11px] font-semibold leading-tight sm:text-xs">{step.title}</span><span className="text-center text-[9px] text-muted-foreground">{withheld ? 'Forecast withheld' : step.phase}</span>
      </button></li>;
    })}
  </ol></nav>;
}