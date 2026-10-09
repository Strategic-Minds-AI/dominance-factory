import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Bot, Send, X, Radio, Zap, Database, Eye, Edit, Cpu,
  Terminal, Webhook, RefreshCw, Globe, Sparkles,
} from "lucide-react";

const GPT_SYNC_ENDPOINT = "https://build-scale-dominate.base44.app/functions/systemGateway";

const QUICK_ACTIONS = [
  { label: "System Status", prompt: "Give me a full system status overview with entity counts", icon: Database },
  { label: "Show Packs", prompt: "Show me all packs in the system", icon: Eye },
  { label: "Research Industry", prompt: "Research the HVAC contractor industry and benchmark the top 3 competitors", icon: Cpu },
  { label: "Scan Systems", prompt: "Scan all my internal systems and show me the inventory", icon: Zap },
  { label: "Build Initiation", prompt: "Start a build initiation for electrical contractor software", icon: Sparkles },
  { label: "Web Search", prompt: "Search the web for the latest trends in field service management software", icon: Globe },
];

export default function AutonomousChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "agent", text: "Autonomous Agent online. I have full natural language understanding and maximum autonomy — I can read, write, execute, provision, research, and search the web. Tell me what you need in plain English." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
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

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    addMessage("user", trimmed);
    setInput("");
    setBusy(true);

    try {
      const history = messages.slice(-8).map((m) => ({
        role: m.role === "agent" ? "assistant" : "user",
        text: m.text,
      }));

      const res = await base44.functions.invoke("autonomousAgent", {
        action: "chat",
        message: trimmed,
        history,
      });

      const reply = res.data?.reply || "I processed your request.";
      addMessage("agent", reply);
    } catch (err) {
      addMessage("agent", "Error: " + (err.message || "Failed to process request. Make sure the autonomous agent function is deployed."));
    }

    setBusy(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
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
                <p className="text-[10px] text-white/50">Full NLP — Zero Limitations</p>
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

          {/* Capability badges */}
          <div className="px-3 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: "Read", icon: Eye },
                { label: "Write", icon: Edit },
                { label: "Execute", icon: Zap },
                { label: "Web", icon: Globe },
                { label: "GPT Sync", icon: Webhook },
              ].map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30"
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
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
                <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-white/40 animate-spin" />
                  <span className="text-xs text-white/40">Processing...</span>
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
                  onClick={() => sendMessage(qa.prompt)}
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
                placeholder="Tell me anything in natural language..."
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