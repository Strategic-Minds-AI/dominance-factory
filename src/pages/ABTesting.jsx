import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Loader2, Trophy, TrendingUp, Plus, CheckCircle2, XCircle } from "lucide-react";

export default function ABTesting() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newTest, setNewTest] = useState({ name: "", test_type: "headline", variant_a: "", variant_b: "", metric: "conversion_rate", website_id: "" });

  const loadTests = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.ABTest.filter({}, { sort: "-created_date", limit: 50 });
      setTests(res.items || res || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadTests(); }, []);

  const createTest = async () => {
    try {
      await base44.entities.ABTest.create({ ...newTest, status: "running", start_date: new Date().toISOString() });
      setNewTest({ name: "", test_type: "headline", variant_a: "", variant_b: "", metric: "conversion_rate", website_id: "" });
      setShowForm(false);
      loadTests();
    } catch (e) { console.error(e); }
  };

  const recordConversion = async (test, variant) => {
    const update = variant === "a"
      ? { variant_a_conversions: (test.variant_a_conversions || 0) + 1 }
      : { variant_b_conversions: (test.variant_b_conversions || 0) + 1 };
    try {
      await base44.entities.ABTest.update(test.id, update);
      loadTests();
    } catch (e) { console.error(e); }
  };

  const recordVisitor = async (test, variant) => {
    const update = variant === "a"
      ? { variant_a_visitors: (test.variant_a_visitors || 0) + 1 }
      : { variant_b_visitors: (test.variant_b_visitors || 0) + 1 };
    try {
      await base44.entities.ABTest.update(test.id, update);
      loadTests();
    } catch (e) { console.error(e); }
  };

  const calcRate = (conversions, visitors) => visitors > 0 ? ((conversions / visitors) * 100).toFixed(1) : "0.0";
  const calcConfidence = (test) => {
    const aRate = test.variant_a_visitors > 0 ? test.variant_a_conversions / test.variant_a_visitors : 0;
    const bRate = test.variant_b_visitors > 0 ? test.variant_b_conversions / test.variant_b_visitors : 0;
    if (test.variant_a_visitors < 30 || test.variant_b_visitors < 30) return 0;
    const diff = Math.abs(aRate - bRate);
    return Math.min(99, Math.round(diff * 100 * 10));
  };

  const typeIcon = (type) => {
    const icons = { headline: "H", cta: "→", layout: "▦", content: "¶", image: "🖼", video: "▶", pricing: "$", form: "☐" };
    return icons[type] || "?";
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              <FlaskConical className="w-4 h-4" /> A/B Testing System
            </div>
            <h1 className="text-2xl font-bold text-white">Experiment & Optimize</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-500 text-white">
            <Plus className="w-4 h-4 mr-1" /> {showForm ? "Cancel" : "New Test"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 bg-zinc-900 border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-white/70 mb-1 block">Test Name</Label><Input value={newTest.name} onChange={(e) => setNewTest({ ...newTest, name: e.target.value })} placeholder="e.g., Homepage Headline Test" className="bg-white/5 border-white/10 text-white" /></div>
              <div><Label className="text-white/70 mb-1 block">Test Type</Label>
                <Select value={newTest.test_type} onValueChange={(v) => setNewTest({ ...newTest, test_type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>{["headline", "cta", "layout", "content", "image", "video", "pricing", "form"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-white/70 mb-1 block">Variant A</Label><Input value={newTest.variant_a} onChange={(e) => setNewTest({ ...newTest, variant_a: e.target.value })} placeholder="e.g., Get Your Free Quote" className="bg-white/5 border-white/10 text-white" /></div>
              <div><Label className="text-white/70 mb-1 block">Variant B</Label><Input value={newTest.variant_b} onChange={(e) => setNewTest({ ...newTest, variant_b: e.target.value })} placeholder="e.g., Find Roofers Near You" className="bg-white/5 border-white/10 text-white" /></div>
              <div><Label className="text-white/70 mb-1 block">Success Metric</Label><Input value={newTest.metric} onChange={(e) => setNewTest({ ...newTest, metric: e.target.value })} placeholder="e.g., conversion_rate" className="bg-white/5 border-white/10 text-white" /></div>
              <div><Label className="text-white/70 mb-1 block">Website ID (optional)</Label><Input value={newTest.website_id} onChange={(e) => setNewTest({ ...newTest, website_id: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            </div>
            <Button onClick={createTest} disabled={!newTest.name || !newTest.variant_a || !newTest.variant_b} className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white">Create & Start Test</Button>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-white/50"><Loader2 className="w-4 h-4 animate-spin" /> Loading tests...</div>
        ) : tests.length === 0 ? (
          <Card className="p-8 bg-zinc-900 border-white/10 text-center"><FlaskConical className="w-8 h-8 text-white/20 mx-auto mb-2" /><p className="text-sm text-white/40">No A/B tests yet. Create one to start experimenting.</p></Card>
        ) : (
          <div className="space-y-3">
            {tests.map((test) => {
              const aRate = calcRate(test.variant_a_conversions, test.variant_a_visitors);
              const bRate = calcRate(test.variant_b_conversions, test.variant_b_visitors);
              const confidence = calcConfidence(test);
              const aWinning = parseFloat(aRate) > parseFloat(bRate);
              const bWinning = parseFloat(bRate) > parseFloat(aRate);
              return (
                <Card key={test.id} className="p-5 bg-zinc-900 border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">{typeIcon(test.test_type)}</span>
                      <p className="text-sm font-bold text-white">{test.name}</p>
                      <Badge variant="outline" className="text-xs text-white/50 border-white/20">{test.test_type}</Badge>
                    </div>
                    <Badge className={`text-xs ${test.status === "running" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-white/10 text-white/50 border-white/20"}`}>{test.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Variant A */}
                    <div className={`p-3 rounded-lg ${aWinning ? "bg-green-500/10 border border-green-500/30" : "bg-white/5 border border-white/10"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-white/60">Variant A</p>
                        {aWinning && test.status === "running" && <Trophy className="w-3 h-3 text-green-400" />}
                      </div>
                      <p className="text-sm text-white mb-2">{test.variant_a}</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div><span className="text-white/40">Visitors: </span><span className="text-white">{test.variant_a_visitors || 0}</span></div>
                        <div><span className="text-white/40">Conversions: </span><span className="text-white">{test.variant_a_conversions || 0}</span></div>
                      </div>
                      <p className="text-lg font-bold text-white mt-1">{aRate}%</p>
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="outline" onClick={() => recordVisitor(test, "a")} className="text-xs h-6 text-white/60 border-white/20">+ Visitor</Button>
                        <Button size="sm" variant="outline" onClick={() => recordConversion(test, "a")} className="text-xs h-6 text-green-400 border-green-500/30">+ Conversion</Button>
                      </div>
                    </div>

                    {/* Variant B */}
                    <div className={`p-3 rounded-lg ${bWinning ? "bg-green-500/10 border border-green-500/30" : "bg-white/5 border border-white/10"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-white/60">Variant B</p>
                        {bWinning && test.status === "running" && <Trophy className="w-3 h-3 text-green-400" />}
                      </div>
                      <p className="text-sm text-white mb-2">{test.variant_b}</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div><span className="text-white/40">Visitors: </span><span className="text-white">{test.variant_b_visitors || 0}</span></div>
                        <div><span className="text-white/40">Conversions: </span><span className="text-white">{test.variant_b_conversions || 0}</span></div>
                      </div>
                      <p className="text-lg font-bold text-white mt-1">{bRate}%</p>
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="outline" onClick={() => recordVisitor(test, "b")} className="text-xs h-6 text-white/60 border-white/20">+ Visitor</Button>
                        <Button size="sm" variant="outline" onClick={() => recordConversion(test, "b")} className="text-xs h-6 text-green-400 border-green-500/30">+ Conversion</Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-white/40" />
                      <span className="text-xs text-white/50">Confidence: <span className={confidence >= 95 ? "text-green-400 font-bold" : confidence >= 80 ? "text-yellow-400" : "text-white/50"}>{confidence}%</span></span>
                    </div>
                    {confidence >= 95 && (aWinning || bWinning) && (
                      <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Winner: {aWinning ? "A" : "B"}</Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}