import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Mail, MessageSquare, Loader2, Play, Pause } from "lucide-react";

const channelIcons = {
  email: <Mail className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
  mms: <MessageSquare className="w-4 h-4" />,
  whatsapp: <MessageSquare className="w-4 h-4" />,
};

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  running: "bg-blue-100 text-blue-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function OutreachManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);
  const [form, setForm] = useState({
    name: "", channel: "email", subject: "", template: "Hi {{first_name}},\n\nI wanted to reach out about {{company}}...",
    from_number: "", from_email: "", media_url: "", target_emails: "", target_phones: "",
  });

  const loadCampaigns = async () => {
    try {
      const { items } = await base44.entities.OutreachCampaign.filter({}, { sort: "-created_date", limit: 50 });
      setCampaigns(items);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCampaigns(); }, []);

  const handleCreate = async () => {
    if (!form.name) return;
    try {
      await base44.entities.OutreachCampaign.create({
        name: form.name,
        channel: form.channel,
        subject: form.subject,
        template: form.template,
        from_number: form.from_number || undefined,
        from_email: form.from_email || undefined,
        media_url: form.media_url || undefined,
        status: "draft",
      });
      setForm({ ...form, name: "", subject: "" });
      await loadCampaigns();
    } catch (e) { console.error(e); }
  };

  const handleSend = async (campaign) => {
    setSending(campaign.id);
    try {
      await base44.entities.OutreachCampaign.update(campaign.id, { status: "running", started_at: new Date().toISOString() });
      const target_emails = form.target_emails ? form.target_emails.split(",").map(s => s.trim()).filter(Boolean) : undefined;
      const target_phones = form.target_phones ? form.target_phones.split(",").map(s => s.trim()).filter(Boolean) : undefined;
      await base44.functions.invoke("sendOutreach", {
        campaign_id: campaign.id,
        channel: campaign.channel,
        template: campaign.template,
        subject: campaign.subject,
        from_number: campaign.from_number,
        from_email: campaign.from_email,
        media_url: campaign.media_url,
        target_emails, target_phones,
        batch_size: 50,
      });
      await loadCampaigns();
    } catch (e) { console.error(e); }
    finally { setSending(null); }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Outreach Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">Launch email, SMS, and MMS campaigns via Resend and Telnyx</p>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold mb-4">Create Campaign</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Campaign Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Q4 Lead Outreach" />
          </div>
          <div>
            <Label>Channel</Label>
            <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email (Resend)</SelectItem>
                <SelectItem value="sms">SMS (Telnyx)</SelectItem>
                <SelectItem value="mms">MMS (Telnyx)</SelectItem>
                <SelectItem value="whatsapp">WhatsApp (Telnyx)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Subject / Preview</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Email subject or SMS preview" />
          </div>
          <div>
            <Label>From Email (Resend)</Label>
            <Input value={form.from_email} onChange={(e) => setForm({ ...form, from_email: e.target.value })} placeholder="you@domain.com" />
          </div>
          <div>
            <Label>From Number (Telnyx)</Label>
            <Input value={form.from_number} onChange={(e) => setForm({ ...form, from_number: e.target.value })} placeholder="+1234567890" />
          </div>
          <div>
            <Label>MMS Media URL</Label>
            <Input value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <Label>Message Template</Label>
            <Textarea value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} rows={4} placeholder="Hi {{first_name}}, ..." />
            <p className="text-xs text-muted-foreground mt-1">Use {"{{first_name}}"}, {"{{company}}"}, {"{{email}}"} for personalization</p>
          </div>
          <div>
            <Label>Target Emails (comma-separated, optional)</Label>
            <Input value={form.target_emails} onChange={(e) => setForm({ ...form, target_emails: e.target.value })} placeholder="a@x.com, b@y.com" />
          </div>
          <div>
            <Label>Target Phones (comma-separated, optional)</Label>
            <Input value={form.target_phones} onChange={(e) => setForm({ ...form, target_phones: e.target.value })} placeholder="+1234, +5678" />
          </div>
        </div>
        <Button onClick={handleCreate} disabled={!form.name} className="mt-4">Create Campaign</Button>
      </Card>

      <div>
        <h2 className="font-semibold mb-3">Campaigns ({campaigns.length})</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : campaigns.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No campaigns yet. Create one above.</Card>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {channelIcons[c.channel]}
                      <h3 className="font-semibold text-sm">{c.name}</h3>
                      <Badge variant="outline" className={`text-xs ${statusStyles[c.status]}`}>{c.status}</Badge>
                    </div>
                    {c.subject && <p className="text-xs text-muted-foreground">{c.subject}</p>}
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.template}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span>Sent: <strong>{c.sent_count || 0}</strong></span>
                      <span className="text-red-500">Failed: <strong>{c.failed_count || 0}</strong></span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleSend(c)} disabled={sending === c.id || c.status === "running"}>
                    {sending === c.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                    {sending === c.id ? "Sending..." : "Launch"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}