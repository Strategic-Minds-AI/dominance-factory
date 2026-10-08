import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import ChatPanel from "@/components/editor/ChatPanel";
import PreviewPanel from "@/components/editor/PreviewPanel";
import { useToast } from "@/components/ui/use-toast";

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
  <p>Use the chat to start building your page.</p>
</div>
</body>
</html>`;

export default function VisualEditor() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! I'm your visual editor assistant. Describe what you want to build and I'll create it in real-time. Try something like 'Create a landing page for a plumbing company in Austin'." },
  ]);
  const [html, setHtml] = useState(INITIAL_HTML);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSend = useCallback(async (text) => {
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

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
      setMessages([...newMessages, { role: "assistant", content: res.message }]);
    } catch (e) {
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

  return (
    <div className="flex h-screen">
      <div className="w-96 border-r border-border flex flex-col bg-background shrink-0">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Chat Editor</h2>
          <p className="text-xs text-muted-foreground">Powered by Vercel AI Gateway</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatPanel messages={messages} loading={loading} onSend={handleSend} />
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Visual Editor</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <PreviewPanel html={html} onSave={handleSave} saving={saving} />
        </div>
      </div>
    </div>
  );
}