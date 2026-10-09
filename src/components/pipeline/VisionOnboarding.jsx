import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import VisionFields from '@/components/pipeline/VisionFields';
import { base44 } from '@/api/base44Client';
export default function VisionOnboarding({ onStart, busy }) {
  const [profile, setProfile] = useState({ owner_name: '', business_name: '', industry: '', location: '', business_type: '', vision: '', style: '', public_research_consent: false });
  const [mode, setMode] = useState(''); const [assisting, setAssisting] = useState(false); const [error, setError] = useState('');
  const assist = async () => { setAssisting(true); setError(''); try { const { data } = await base44.functions.invoke('programmaticPipeline', { action: 'refine_vision', profile }); if (data.error) throw new Error(data.error); setProfile(p => ({ ...p, vision: data.vision })); } catch (e) { setError(e.response?.data?.error || e.message); } finally { setAssisting(false); } };
  return <form onSubmit={e => { e.preventDefault(); onStart({ profile, mode }); }} className="space-y-6">
    <div className="space-y-2"><Label htmlFor="pipeline-vision">Your Vision, In Your Own Words *</Label><Textarea id="pipeline-vision" rows={4} maxLength={2000} required disabled={busy || assisting} value={profile.vision} onChange={e => setProfile({ ...profile, vision: e.target.value })} placeholder="Start with the business you want to build and the people you want to help." /><Button type="button" variant="outline" onClick={assist} disabled={busy || assisting || !profile.vision.trim()}>{assisting ? <Loader2 className="animate-spin" /> : <Sparkles />} Help Clarify My Vision</Button><p className="text-xs text-muted-foreground">Review and edit the suggestion. AI will not invent your identity or contact details.</p></div>
    <VisionFields profile={profile} onChange={setProfile} disabled={busy} />
    <fieldset className="space-y-3"><legend className="mb-3 text-base font-semibold">Do you want this system to perform autonomously or manually?</legend><div className="grid gap-3 sm:grid-cols-2">{[['autonomous','Autonomously','Advance connected stages in the background; stop for evidence, design approval and release gates.'],['manual','Manually','Run each connected stage yourself and review its saved output before continuing.']].map(([value, label, text]) => <label key={value} className="flex cursor-pointer gap-3 rounded-lg border border-border bg-secondary/40 p-4"><input type="radio" name="pipeline-mode" required value={value} checked={mode === value} disabled={busy} onChange={() => setMode(value)} className="mt-1 h-4 w-4 accent-primary" /><span><span className="font-semibold">{label}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{text}</span></span></label>)}</div></fieldset>
    <label className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" required checked={profile.public_research_consent} onChange={e => setProfile({ ...profile, public_research_consent: e.target.checked })} className="mt-1 h-4 w-4 accent-primary" /><span>I consent to research of my public business presence and industry. No private skip tracing or inferred personal profile.</span></label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={busy || assisting} className="h-11">{busy ? <Loader2 className="animate-spin" /> : <ArrowRight />} Save Vision & Start Pipeline</Button>
  </form>;
}