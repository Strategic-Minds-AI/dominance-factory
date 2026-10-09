import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, ArrowRight, ArrowLeft, Sparkles, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";

export default function TopicDiscovery({ selectedTopic, onSelect, context, onComplete, onBack }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const discoverTopics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("onboardingAI", {
        action: "discover_topics",
        context,
      });
      const topicList = res?.topics || res?.data?.topics || [];
      setTopics(topicList);
      if (topicList.length === 0) {
        setError("AI could not generate topics. Try again.");
      }
    } catch (e) {
      setError(e.message || "Failed to discover topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    discoverTopics();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
          <Search className="w-4 h-4" /> Step 3: Topic Discovery
        </div>
        <h2 className="text-xl font-bold text-white">Top 10 Researched Problem Topics</h2>
        <p className="text-sm text-white/50 mt-1">
          These are the top 10 most-searched Google topics related to problems in your industry. Select one to focus your strategy.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm text-white/50 mt-3">Researching top Google search topics...</p>
        </div>
      )}

      {error && !loading && (
        <Card className="p-6 bg-red-500/5 border-red-500/30 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-300 mb-3">{error}</p>
          <Button variant="outline" onClick={discoverTopics} className="border-white/10 text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </Card>
      )}

      {!loading && !error && topics.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topics.map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(topic.title)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedTopic === topic.title
                    ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30"
                    : "border-white/10 bg-zinc-900 hover:border-blue-500/40 hover:bg-blue-500/5"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      selectedTopic === topic.title ? "bg-blue-500 text-white" : "bg-white/10 text-white/60"
                    }`}>
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-white">{topic.title}</h3>
                  </div>
                  {topic.search_volume && (
                    <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {topic.search_volume}
                    </Badge>
                  )}
                </div>
                {topic.problem && (
                  <p className="text-xs text-white/50 mb-1">
                    <span className="text-white/70 font-medium">Problem:</span> {topic.problem}
                  </p>
                )}
                {topic.opportunity && (
                  <p className="text-xs text-blue-300/70">
                    <span className="font-medium">Opportunity:</span> {topic.opportunity}
                  </p>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="border-white/10 text-white/70 hover:bg-white/5">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={onComplete}
              disabled={!selectedTopic}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Continue to Research
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}