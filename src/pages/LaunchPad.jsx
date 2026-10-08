import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Plus, FileText } from "lucide-react";

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function LaunchPad() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const page = await base44.entities.LaunchCampaign.filter({}, { sort: "-created_date", limit: 50 });
        setCampaigns(page.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Launch Pad</h1>
          <p className="text-muted-foreground">Launch hundreds or thousands of programmatic pages at scale</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Rocket className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-1">No campaigns yet</h3>
          <p className="text-sm text-muted-foreground">Create a campaign to generate pages across locations and services</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const progress = c.total_pages > 0 ? Math.round((c.pages_generated / c.total_pages) * 100) : 0;
            return (
              <Card key={c.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <Badge variant="outline" className={`text-xs ${statusStyles[c.status] || statusStyles.draft}`}>
                      {c.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      {c.pages_generated || 0} / {c.total_pages || 0} pages
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}