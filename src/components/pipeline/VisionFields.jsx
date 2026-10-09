import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
const fields = [['owner_name','Your Name','text',true],['business_name','Business Name','text',true],['industry','Industry','text',true],['location','Market / Service Area','text',true],['website_url','Existing Business Website','url',false],['style','Style & Preferences','text',false],['email','Public Business Email','email',false],['phone','Public Business Phone','tel',false]];
export default function VisionFields({ profile, onChange, disabled }) {
  return <div className="grid gap-4 sm:grid-cols-2">
    {fields.map(([key, label, type, required]) => <div className="space-y-2" key={key}><Label htmlFor={'pipeline-' + key}>{label}{required ? ' *' : ''}</Label><Input id={'pipeline-' + key} type={type} maxLength={300} required={required} disabled={disabled} value={profile[key] || ''} onChange={e => onChange({ ...profile, [key]: e.target.value })} /></div>)}
    <div className="space-y-2 sm:col-span-2"><Label htmlFor="pipeline-business-type">What Do You Want To Do? *</Label><select id="pipeline-business-type" required disabled={disabled} value={profile.business_type} onChange={e => onChange({ ...profile, business_type: e.target.value })} className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"><option value="">Choose your business goal</option><option value="new_business">Build a new business</option><option value="ai_enhanced">Enhance my existing business</option><option value="rebrand">Rebrand my business</option></select></div>
  </div>;
}