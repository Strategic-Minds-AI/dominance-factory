import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function OnboardingStep({ onComplete }) {
  const [form, setForm] = useState({
    session_label: "",
    full_name: "",
    email: "",
    phone: "",
    business_type: "new_business",
    vision_statement: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.session_label || !form.vision_statement) {
      setError("Please provide a session label and your vision.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const session = await base44.entities.OnboardingSession.create({
        ...form,
        status: "in_progress",
        current_step: 1,
        skip_trace_status: "pending",
      });
      onComplete(session);
    } catch (err) {
      setError(err.message || "Failed to start session. Check credits and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Tell Us Your Vision</h2>
        <p className="text-slate-400">This is the only thing you need to do. Everything else is automated.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-[#0d141e]/60 backdrop-blur border border-cyan-500/15 rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 mb-1.5 block">Session Label</Label>
            <Input value={form.session_label} onChange={update("session_label")} placeholder="e.g. HVAC Empire Launch" className="bg-[#05070a] border-slate-700 text-white" />
          </div>
          <div>
            <Label className="text-slate-300 mb-1.5 block">Full Name</Label>
            <Input value={form.full_name} onChange={update("full_name")} placeholder="Your name" className="bg-[#05070a] border-slate-700 text-white" />
          </div>
          <div>
            <Label className="text-slate-300 mb-1.5 block">Email</Label>
            <Input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" className="bg-[#05070a] border-slate-700 text-white" />
          </div>
          <div>
            <Label className="text-slate-300 mb-1.5 block">Phone</Label>
            <Input value={form.phone} onChange={update("phone")} placeholder="(555) 555-5555" className="bg-[#05070a] border-slate-700 text-white" />
          </div>
        </div>

        <div>
          <Label className="text-slate-300 mb-1.5 block">Business Type</Label>
          <select value={form.business_type} onChange={update("business_type")} className="w-full h-9 rounded-md border border-slate-700 bg-[#05070a] px-3 text-white text-sm">
            <option value="new_business">New Business</option>
            <option value="ai_enhanced">AI-Enhanced Existing Business</option>
            <option value="rebrand">Rebrand</option>
          </select>
        </div>

        <div>
          <Label className="text-slate-300 mb-1.5 block">Your Vision</Label>
          <Textarea value={form.vision_statement} onChange={update("vision_statement")} placeholder="Describe your business, target market, goals, and what success looks like..." rows={5} className="bg-[#05070a] border-slate-700 text-white resize-none" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-[#05070a] font-bold h-12 text-base">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Starting...</> : <>Launch God Mode <Sparkles className="w-4 h-4 ml-2" /></>}
        </Button>
      </form>
    </div>
  );
}