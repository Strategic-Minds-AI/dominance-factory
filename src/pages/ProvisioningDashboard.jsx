import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Server, Globe, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

const statusIcons = {
  pending: <Clock className="w-4 h-4 text-amber-500" />,
  provisioning: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
  deployed: <CheckCircle className="w-4 h-4 text-green-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
};

export default function ProvisioningDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);
  const [form, setForm] = useState({ name: "", job_type: "browser_service", repo_url: "", env_vars: "" });

  const loadJobs = async () => {
    try {
      const { items } = await base44.entities.ProvisioningJob.filter({}, { sort: "-created_date", limit: 50 });
      setJobs(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const handleProvision = async () => {
    if (!form.name) return;
    setProvisioning(true);
    try {
      const envVars = form.env_vars ? JSON.parse(form.env_vars) : {};
      await base44.functions.invoke("provisionSystem", {
        name: form.name,
        job_type: form.job_type,
        repo_url: form.repo_url || undefined,
        env_vars: envVars,
      });
      setForm({ name: "", job_type: "browser_service", repo_url: "", env_vars: "" });
      await loadJobs();
    } catch (e) {
      console.error(e);
    } finally {
      setProvisioning(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Provisioning Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Deploy Railway services, Vercel sites, and full-stack systems automatically</p>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Rocket className="w-4 h-4" /> New Provisioning Job</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>System Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Client Portal Backend" />
          </div>
          <div>
            <Label>Provisioning Type</Label>
            <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="browser_service">Browser Service (Railway)</SelectItem>
                <SelectItem value="website">Website (Vercel)</SelectItem>
                <SelectItem value="agent_system">Agent System (Railway)</SelectItem>
                <SelectItem value="full_stack">Full Stack (Railway + Vercel)</SelectItem>
                <SelectItem value="social_suite">Social Suite (Railway + Vercel)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Repository URL (for Railway)</Label>
            <Input value={form.repo_url} onChange={(e) => setForm({ ...form, repo_url: e.target.value })} placeholder="https://github.com/..." />
          </div>
          <div>
            <Label>Environment Variables (JSON)</Label>
            <Input value={form.env_vars} onChange={(e) => setForm({ ...form, env_vars: e.target.value })} placeholder='{"KEY":"value"}' />
          </div>
        </div>
        <Button onClick={handleProvision} disabled={provisioning || !form.name} className="mt-4">
          {provisioning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
          {provisioning ? "Provisioning..." : "Provision System"}
        </Button>
      </Card>

      <div>
        <h2 className="font-semibold mb-3">Provisioning Jobs ({jobs.length})</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : jobs.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No provisioning jobs yet. Create one above.</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{job.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{job.job_type?.replace(/_/g, " ")}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {statusIcons[job.status] || statusIcons.pending}
                    <span className="text-xs capitalize">{job.status}</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {job.railway_url && (
                    <div className="flex items-center gap-2"><Server className="w-3 h-3 text-muted-foreground" /><a href={job.railway_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">{job.railway_url}</a></div>
                  )}
                  {job.vercel_url && (
                    <div className="flex items-center gap-2"><Globe className="w-3 h-3 text-muted-foreground" /><a href={job.vercel_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">{job.vercel_url}</a></div>
                  )}
                  {job.domain && <div className="text-muted-foreground">Domain: {job.domain}</div>}
                  {job.error && <div className="text-red-500 truncate">{job.error}</div>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}