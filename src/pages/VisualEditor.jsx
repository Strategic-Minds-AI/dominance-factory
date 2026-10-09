import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import PreviewPanel from "@/components/editor/PreviewPanel";
import PackGallery from "@/components/editor/PackGallery";
import { Button } from "@/components/ui/button";
import { Send, Loader2, PanelLeft, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CATEGORIES } from "@/lib/websiteTemplates";

const INITIAL_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Preview</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #fafafa; color: #737373; }
.placeholder { text-align: center; padding: 2rem; }
.placeholder h1 { font-size: 1.5rem; font-weight: 700; color: #0a0a0a; margin-bottom: 0.5rem; }
.placeholder p { font-size: 0.875rem; }
</style>
</head>
<body>
<div class="placeholder">
  <h1>Visual Editor</h1>
  <p>Pick a pack from the gallery or type a command below to start building.</p>
</div>
</body>
</html>`;

export default function VisualEditor() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Describe what you want to build and I'll create it live." },
  ]);
  const [html, setHtml] = useState(INITIAL_HTML);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastResponse, setLastResponse] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(true);
  const [selectedPack, setSelectedPack] = useState(null);
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [pendingCategory, setPendingCategory] = useState("other");
  const { toast } = useToast();

  const handleSend = useCallback(async (text) => {
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    setInput("");

    try {
      const res = await base44.functions.invoke("chatEdit", {
        message: text,
        current_html: html,
        history: messages,
      });

      if (res.error) throw new Error(res.error);

      if (res.action === "edit" && res.html) {
        setHtml(res.html);
      }
      setLastResponse(res.message);
      setMessages([...newMessages, { role: "assistant", content: res.message }]);
    } catch (e) {
      setLastResponse(`Error: ${e.message}`);
      setMessages([...newMessages, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }, [messages, html]);

  const handleSave = async () => {
    const name = window.prompt("Website name:", "Untitled Website");
    if (!name) return;

    setSaving(true);
    try {
      await base44.entities.Website.create({
        name,
        preview_html: html,
        status: "draft",
      });
      toast({ title: "Saved to Website Library", description: name });
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    handleSend(input.trim());
  };

  const handleSelectPack = (pack) => {
    setSelectedPack(pack);
    if (pack.preview_html) {
      setHtml(pack.preview_html);
      setLastResponse(`Loaded: ${pack.name}`);
    }
    setPendingCategory(pack.category || "other");
  };

  const handleApprove = async (pack, category) => {
    const cat = category || pack.category || pendingCategory || "other";
    setApproving(pack.id);
    try {
      await base44.entities.Pack.update(pack.id, {
        status: "approved",
        category: cat,
        reviewed_at: new Date().toISOString(),
      });
      toast({ title: "Approved & added to library", description: `${pack.name} → ${CATEGORIES.find((c) => c.id === cat)?.label || cat}` });
      setSelectedPack({ ...pack, status: "approved", category: cat });
    } catch (e) {
      toast({ title: "Approval failed", description: e.message, variant: "destructive" });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (pack) => {
    setRejecting(pack.id);
    try {
      await base44.entities.Pack.update(pack.id, {
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      });
      toast({ title: "Disapproved", description: pack.name });
      setSelectedPack({ ...pack, status: "rejected" });
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setRejecting(null);
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {galleryOpen && (
        <PackGallery
          selectedPack={selectedPack}
          onSelectPack={handleSelectPack}
          onApprove={(pack) => handleApprove(pack, pack.category || pendingCategory)}
          onReject={handleReject}
          approving={approving}
          rejecting={rejecting}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-3 py-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGalleryOpen(!galleryOpen)}
            className="text-neutral-400 hover:text-white"
          >
            <PanelLeft className="h-4 w-4 mr-1" />
            {galleryOpen ? "Hide" : "Show"} Gallery
          </Button>
          {selectedPack && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-neutral-500 truncate max-w-32 hidden md:block">{selectedPack.name}</span>
              <select
                value={pendingCategory}
                onChange={(e) => setPendingCategory(e.target.value)}
                className="bg-neutral-900 text-white text-xs rounded px-2 py-1 border border-neutral-700 focus:outline-none max-w-40"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-400"
                onClick={() => handleApprove(selectedPack, pendingCategory)}
                disabled={approving === selectedPack.id || selectedPack.status === "approved"}
              >
                {approving === selectedPack.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                onClick={() => handleReject(selectedPack)}
                disabled={rejecting === selectedPack.id || selectedPack.status === "rejected"}
              >
                {rejecting === selectedPack.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                Disapprove
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <PreviewPanel html={html} onSave={handleSave} saving={saving} />
        </div>

        {lastResponse && !loading && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4 pointer-events-none z-10">
            <div className="bg-neutral-900/95 text-neutral-200 rounded-lg px-4 py-2.5 text-sm border border-neutral-700 shadow-2xl">
              {lastResponse}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-neutral-800 bg-neutral-950 p-3 shrink-0">
          <div className="flex gap-2 items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you want to build or change..."
              disabled={loading}
              className="flex-1 bg-neutral-900 text-white rounded-lg px-4 py-3 text-sm border border-neutral-700 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-500 disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="shrink-0 bg-white text-black hover:bg-neutral-200 h-11 w-11"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}