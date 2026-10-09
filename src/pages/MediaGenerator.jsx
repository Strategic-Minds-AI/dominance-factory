import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, ImageIcon, FileText, Megaphone } from "lucide-react";

const typeIcons = {
  image: <ImageIcon className="w-4 h-4" />,
  social_post: <FileText className="w-4 h-4" />,
  ad_creative: <Megaphone className="w-4 h-4" />,
  card: <FileText className="w-4 h-4" />,
  graphic: <ImageIcon className="w-4 h-4" />,
  video: <ImageIcon className="w-4 h-4" />,
};

export default function MediaGenerator() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    name: "", asset_type: "social_post", prompt: "", platform: "general", count: 1, business_info: "",
  });
  const [lastResult, setLastResult] = useState(null);

  const loadAssets = async () => {
    try {
      const { items } = await base44.entities.MediaAsset.filter({}, { sort: "-created_date", limit: 50 });
      setAssets(items);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAssets(); }, []);

  const handleGenerate = async () => {
    if (!form.prompt) return;
    setGenerating(true);
    setLastResult(null);
    try {
      const res = await base44.functions.invoke("generateMedia", {
        name: form.name || `Asset ${Date.now()}`,
        asset_type: form.asset_type,
        prompt: form.prompt,
        platform: form.platform,
        count: form.count,
        business_info: form.business_info || undefined,
      });
      setLastResult(res.data);
      setForm({ ...form, prompt: "", name: "" });
      await loadAssets();
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Media Generator</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate social posts, ad creatives, image prompts, and business cards via Vercel AI Gateway</p>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Generate New Asset</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Asset Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Q4 Promo Graphic" />
          </div>
          <div>
            <Label>Asset Type</Label>
            <Select value={form.asset_type} onValueChange={(v) => setForm({ ...form, asset_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="social_post">Social Post (text)</SelectItem>
                <SelectItem value="ad_creative">Ad Creative (multi-variant)</SelectItem>
                <SelectItem value="card">Business Card</SelectItem>
                <SelectItem value="graphic">Graphic Design</SelectItem>
                <SelectItem value="image">Image Prompt</SelectItem>
                <SelectItem value="video">Video Prompt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Platform</Label>
            <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Count</Label>
            <Input type="number" min="1" max="5" value={form.count} onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) || 1 })} />
          </div>
          <div className="md:col-span-2">
            <Label>Business Info (context for generation)</Label>
            <Input value={form.business_info} onChange={(e) => setForm({ ...form, business_info: e.target.value })} placeholder="e.g. a roofing company in Dallas, TX" />
          </div>
          <div className="md:col-span-2">
            <Label>Prompt / Topic</Label>
            <Textarea value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} rows={3} placeholder="Describe what you want to generate..." />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={generating || !form.prompt} className="mt-4">
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {generating ? "Generating..." : "Generate"}
        </Button>
      </Card>

      {lastResult && (
        <Card className="p-5 bg-blue-50/50 border-blue-200">
          <h3 className="font-semibold text-sm mb-2">Last Generation Result</h3>
          <pre className="text-xs text-muted-foreground overflow-auto max-h-48 whitespace-pre-wrap">{JSON.stringify(lastResult, null, 2)}</pre>
        </Card>
      )}

      <div>
        <h2 className="font-semibold mb-3">Generated Assets ({assets.length})</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : assets.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No assets generated yet.</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {typeIcons[a.asset_type]}
                    <span className="text-xs font-medium">{a.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{a.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{a.prompt}</p>
                {a.metadata && (
                  <pre className="text-xs text-muted-foreground bg-muted/50 rounded p-2 overflow-auto max-h-32 whitespace-pre-wrap">{(() => {
                    try { return JSON.stringify(JSON.parse(a.metadata), null, 2).substring(0, 500); } catch { return a.metadata?.substring(0, 500); }
                  })()}</pre>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}