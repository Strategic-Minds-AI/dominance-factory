import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function CampaignCard({ campaign }) {
  const total = campaign.total_pages || 0;
  const generated = campaign.pages_generated || 0;
  const progress = total > 0 ? Math.round((generated / total) * 100) : 0;
  const isRunning = campaign.status === "running";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{campaign.name}</CardTitle>
          <Badge variant="outline" className={`text-xs ${statusStyles[campaign.status] || statusStyles.draft}`}>
            {isRunning && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
            {campaign.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="w-4 h-4" />
            {generated.toLocaleString()} / {total.toLocaleString()} pages
          </span>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </span>
          )}
          {campaign.status === "completed" && (
            <span className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Complete
            </span>
          )}
        </div>

        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isRunning ? "bg-blue-500" : "bg-primary"}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{progress}% complete</span>
          {campaign.completed_at && (
            <span>Finished {new Date(campaign.completed_at).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}