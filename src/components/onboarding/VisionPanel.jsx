import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, ArrowRight, ArrowLeft, RefreshCw, Eye } from "lucide-react";

export default function VisionPanel({ vision, onChange, context, onComplete, onBack }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleAIComplete = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await base44.functions.invoke("onboardingAI", {
        action: "generate_vision",
        partialText: vision || "",
        context,
      });
      const completed = res?.vision || res?.data?.vision || "";
      if (completed) {
        onChange(completed);
      } else {
        setError("AI could not complete the vision. Try writing more and click again.");
      }
    } catch (e) {
      setError(e.message || "AI completion failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
          <Eye className="w-4 h-4" /> Step 2: Vision Statement
        </div>
        <h2 className="text-xl font-bold text-white">Define Your Vision</h2>
        <p className="text-sm text-white/50 mt-1">
          Start typing your vision statement. Click "AI Complete" to let AI finish your sentence with intelligent word and sentence completion.
        </p>
      </div>

      <Card className="p-5 bg-zinc-900 border-white/10">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-white">Your Vision Statement</Label>
          <Button
            type="button"
            size="sm"
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={handleAIComplete}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            )}
            AI Complete
          </Button>
        </div>
        <Textarea
          value={vision || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start typing your vision... e.g. 'We exist to help small businesses in Dallas dominate their local market by...'"
          className="bg-zinc-950 border-white/10 text-white min-h-[200px] text-sm leading-relaxed"
        />
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        <p className="text-xs text-white/40 mt-2">
          The AI uses everything you've provided so far to complete your vision with context-aware intelligence.
        </p>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="border-white/10 text-white/70 hover:bg-white/5">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onComplete}
          disabled={!vision || vision.trim().length < 10}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          Continue to Topics
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}