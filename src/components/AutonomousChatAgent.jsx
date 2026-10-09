import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Bot, Send, X, Radio, Zap, Database, Eye, Edit, Cpu,
  Terminal, Webhook, RefreshCw,
} from "lucide-react";

const GPT_SYNC_ENDPOINT = "https://build-scale-dominate.base44.app/functions/systemGateway";

const QUICK_ACTIONS = [
  { label: "System Status", cmd: "status", icon: Database },
  { label: "Query Website", cmd: "query Website", icon: Eye },
  { label: "Query Pack", cmd: "query Pack", icon: Eye },
  { label: "List Agents", cmd: "query Agent", icon: Bot },
  { label: "Invoke Research", cmd: "invoke autonomousResearchEngine", icon: Cpu },
  { label: "Help", cmd: "help", icon: Terminal },
];

export default function AutonomousChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "agent", text: "Autonomous Chat Agent online. I have maximum autonomy — Read, Write, Execute, and GPT Sync are all enabled. Type 'help' for commands or use the quick actions below." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [autonomy, setAutonomy] = useState({ read: true, write: true, execute: true, gptSync: true });
  const [gptSyncActive, setGptSyncActive] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  const executeCommand = async (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addMessage("user", trimmed);
    setInput("");
    setBusy(true);

    try {
      const parts = trimmed.split(/\s+/);
      const command = parts[0].toLowerCase();

      if (command === "help" || trimmed === "?") {
        addMessage("agent", [
          "Available commands:",
          "  status — Get system overview with entity counts",
          "  query <entity> — List records from any entity",
          "  get <entity> <id> — Get a single record",
          "  create <entity> <json> — Create a record (requires Write)",
          "  update <entity> <id> <json> — Update a record (requires Write)",
          "  invoke <function> [json] — Invoke a backend function (requires Execute)",
          "  functions — List all available backend functions",
          "  gpt sync — Toggle GPT sync channel",
          "",
          "Entities: Website, Pack, Agent, SocialPost, LaunchCampaign, etc.",
          "Functions: autonomousResearchEngine, godModeSeo, generatePage, socialMediaEngine, etc.",
        ].join("\n"));
      } else if (command === "status") {
        if (!autonomy.read) { addMessage("agent", "Warning: Read autonomy is disabled."); return; }
        const entities = ["Website", "Pack", "Agent", "SocialPost", "LaunchCampaign", "GeneratedPage", "ProvisioningJob", "OutreachCampaign", "OnboardingSession"];
        const counts = {};
        for (const e of entities) {
          try {
            const c = await base44.entities[e]?.count?.({});
            if (typeof c === "number") counts[e] = c;
          } catch {}
        }
        const summary = Object.entries(counts).map(([k, v]) => "  " + k + ": " + v).join("\n");
        addMessage("agent", "System Status\n\nConnected entities:\n" + (summary || "(no data)"));
      } else if (command === "query" || command === "list") {
        if (!autonomy.read) { addMessage("agent", "Warning: Read autonomy is disabled."); return; }
        const entity = parts[1];
        if (!entity) { addMessage("agent", "Usage: query <entity>"); return; }
        try {
          const res = await base44.entities[entity]?.filter?.({}, { limit: 10, sort: "-created_date" });
          const items = res?.items || res || [];
          if (items.length === 0) { addMessage("agent", "No records found in " + entity + "."); return; }
          const summary = items.map((r, i) => (i + 1) + ". " + (r.name || r.title || r.id)).join("\n");
          addMessage("agent", entity + " (" + items.length + " records):\n" + summary);
        } catch (e) {
          addMessage("agent", "Error querying " + entity + ": " + e.message);
        }
      } else if (command === "get") {
        if (!autonomy.read) { addMessage("agent", "Warning: Read autonomy is disabled."); return; }
        const entity = parts[1];
        const id = parts[2];
        if (!entity || !id) { addMessage("agent", "Usage: get <entity> <id>"); return; }
        try {
          const record = await base44.entities[entity]?.get?.(id);
          addMessage("agent", entity + " record:\n" + JSON.stringify(record, null, 2).slice(0, 2000));
        } catch (e) {
          addMessage("agent", "Error: " + e.message);
        }
      } else if (command === "create") {
        if (!autonomy.write) { addMessage("agent", "Warning: Write autonomy is disabled."); return; }
        const entity = parts[1];
        if (!entity) { addMessage("agent", "Usage: create <entity> <json>"); return; }
        const jsonStr = trimmed.slice(entity.length + 8).trim();
        let data;
        try { data = JSON.parse(jsonStr); } catch { addMessage("agent", 'Invalid JSON. Example: create Pack {"name":"Test Pack"}'); return; }
        try {
          const record = await base44.entities[entity]?.create?.(data);
          addMessage("agent", "Created " + entity + " record: " + (record?.id || "success"));
        } catch (e) {
          addMessage("agent", "Error creating " + entity + ": " + e.message);
        }
      } else if (command === "update") {
        if (!autonomy.write) { addMessage("agent", "Warning: Write autonomy is disabled."); return; }
        const entity = parts[1];
        const id = parts[2];
        if (!entity || !id) { addMessage("agent", "Usage: update <entity> <id> <json>"); return; }
        const jsonStr = parts.slice(3).join(" ");
        let data;
        try { data = JSON.parse(jsonStr); } catch { addMessage("agent", "Invalid JSON."); return; }
        try {
          await base44.entities[entity]?.update?.(id, data);
          addMessage("agent", "Updated " + entity + " " + id);
        } catch (e) {
          addMessage("agent", "Error: " + e.message);
        }
      } else if (command === "invoke") {
        if (!autonomy.execute) { addMessage("agent", "Warning: Execute autonomy is disabled."); return; }
        const fn = parts[1];
        if (!fn) { addMessage("agent", "Usage: invoke <function> [json]"); return; }
        const jsonStr = trimmed.slice(fn.length + 8).trim();
        let payload = {};
        if (jsonStr) { try { payload = JSON.parse(jsonStr); } catch { addMessage("agent", "Invalid JSON payload."); return; } }
        try {
          addMessage("agent", "Invoking " + fn + "...");
          const res = await base44.functions.invoke(fn, payload);
          const result = res?.data || res;
          const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);
          addMessage("agent", fn + " result:\n" + text.slice(0, 3000));
        } catch (e) {
          addMessage("agent", "Error invoking " + fn + ": " + e.message);
        }
      } else if (command === "functions") {
        const fns = ["autonomousResearchEngine", "godModeSeo", "generatePage", "processGenerationQueue", "launchCampaign", "generateSocialContent", "socialMediaEngine", "generateMedia", "generateBusinessName", "executeAgentTask", "ingestPack", "provisionApprovedPack", "provisionSystem", "sendOutreach", "dailyFollowUp", "onboardingAI", "chatEdit", "systemGateway", "supabaseConvergence"];
        addMessage("agent", "Available functions (" + fns.length + "):\n" + fns.map((f) => "  - " + f).join("\n"));
      } else if (command === "gpt" && parts[1]?.toLowerCase() === "sync") {
        setGptSyncActive((prev) => {
          const next = !prev;
          addMessage("agent", next ? "GPT Sync channel ACTIVATED. External GPT can now send commands via the system gateway endpoint." : "GPT Sync channel deactivated.");
          return next;
        });
      } else {
        addMessage("agent", 'Unknown command: "' + trimmed + '". Type "help" for available commands.');
      }
    } catch (e) {
      addMessage("agent", "Unexpected error: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    executeCommand(input);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#1e40af] text-white rounded-l-xl px-2 py-4 shadow-2xl hover:bg-[#2563eb] transition-colors border border-white/10 border-r-0"
          title="Open Autonomous Chat Agent"
        >
          <div className="flex flex-col items-center gap-1">
            <Bot className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Agent</span>
          </div>
        </button>
      )}

      {open && (
        <div className="fixed right-0 top-0 bottom-0 z-50 w-96 max-w-[90vw] bg-[#0a0a0a] border-l border-white/10 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#1e40af]/20">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="w-5 h-5 text-blue-400" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Autonomous Agent</h3>
                <p className="text-[10px] text-white/50">Maximum Autonomy Mode</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setGptSyncActive((p) => !p)}
                className={"p-1.5 rounded-md transition-colors " + (gptSyncActive ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/40")}
                title="GPT Sync Channel"
              >
                <Radio className="w-4 h-4" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Autonomy controls */}
          <div className="px-3 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: "read", label: "Read", icon: Eye },
                { key: "write", label: "Write", icon: Edit },
                { key: "execute", label: "Execute", icon: Zap },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setAutonomy((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={"flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors " +
                    (autonomy[key] ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/5 text-white/30 border border-white/10")}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
              <button
                onClick={() => setAutonomy((prev) => ({ ...prev, gptSync: !prev.gptSync }))}
                className={"flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors " +
                  (autonomy.gptSync ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-white/30 border border-white/10")}
              >
                <Webhook className="w-3 h-3" />
                GPT Sync
              </button>
            </div>
          </div>

          {/* GPT Sync banner */}
          {gptSyncActive && (
            <div className="px-3 py-2 bg-green-500/5 border-b border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                <span className="text-xs font-semibold text-green-400">GPT Sync Channel Active</span>
              </div>
              <p className="text-[10px] text-white/40 mb-1">External GPT can command this agent via:</p>
              <code className="text-[10px] text-green-300/70 bg-black/40 px-1.5 py-0.5 rounded block break-all">{GPT_SYNC_ENDPOINT}</code>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {messages.map((msg, i) => (
              <div key={i} className={"flex " + (msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={"max-w-[85%] rounded-lg px-3 py-2 text-xs " +
                  (msg.role === "user" ? "bg-blue-600 text-white" : "bg-white/5 text-white/80 border border-white/10")}>
                  {msg.role === "agent" && <Bot className="w-3 h-3 text-blue-400 inline mr-1.5 mb-0.5" />}
                  <pre className="whitespace-pre-wrap font-sans break-words">{msg.text}</pre>
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <RefreshCw className="w-3.5 h-3.5 text-white/40 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="px-3 py-2 border-t border-white/10 bg-white/5">
            <div className="flex flex-wrap gap-1 mb-2">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => executeCommand(qa.cmd)}
                  disabled={busy}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 transition-colors disabled:opacity-30"
                >
                  <qa.icon className="w-3 h-3" />
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-[#0a0a0a]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a command... (try 'help')"
                disabled={busy}
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
              />
              <Button type="submit" size="sm" disabled={busy || !input.trim()} className="bg-blue-600 hover:bg-blue-500 text-white">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}