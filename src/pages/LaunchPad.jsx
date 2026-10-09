import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Rocket, Plus, Zap, Loader2 } from "lucide-react";
import CampaignForm from "@/components/launch/CampaignForm";
import CampaignCard from "@/components/launch/CampaignCard";

export default function LaunchPad() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processLog, setProcessLog] = useState({ processed: 0, remaining: 0 });

  const loadCampaigns = useCallback(async () => {
    try {
      const page = await base44.entities.LaunchCampaign.filter({}, { sort: "-created_date", limit: 50 });
      setCampaigns(page.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Auto-refresh while any campaign is running
  const hasRunning = campaigns.some((c) => c.status === "running");
  useEffect(() => {
    if (!hasRunning) return;
    const interval = setInterval(loadCampaigns, 10000);
    return () => clearInterval(interval);
  }, [hasRunning, loadCampaigns]);

  const handleProcessNow = async () => {
    setProcessing(true);
    setProcessLog({ processed: 0, remaining: 0 });
    try {
      // Loop through the queue in batches of 10 until empty or ~4 minutes elapsed
      let totalProcessed = 0;
      let remaining = 1;
      const startTime = Date.now();
      while (remaining > 0 && Date.now() - startTime < 240000) {
        const res = await base44.functions.invoke("processGenerationQueue", { batch_size: 10 });
        totalProcessed += res.pages_processed || 0;
        remaining = res.remaining || 0;
        setProcessLog({ processed: totalProcessed, remaining });
        await loadCampaigns();
        if (res.pages_processed === 0) break;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Launch Pad</h1>
          <p className="text-muted-foreground">Launch hundreds to millions of programmatic pages at scale</p>
        </div>
        <div className="flex items-center gap-2">
          {hasRunning && (
            <Button variant="outline" onClick={handleProcessNow} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {processing
                ? `Processing... ${processLog.processed} done, ${processLog.remaining} left`
                : "Process Queue Now"}
            </Button>
          )}
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Rocket className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-1">No campaigns yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Paste your locations and services, pick a website template, and launch thousands of pages in one click.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Create Your First Campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}

      <CampaignForm open={showForm} onClose={() => setShowForm(false)} onLaunched={loadCampaigns} />
    </div>
  );
}