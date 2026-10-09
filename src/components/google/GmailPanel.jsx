import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Inbox, Loader2, Mail } from "lucide-react";

export default function GmailPanel() {
  const [mode, setMode] = useState('send');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sendForm, setSendForm] = useState({ to: '', subject: '', html: '' });
  const [searchQ, setSearchQ] = useState('');
  const [messages, setMessages] = useState([]);

  const sendEmail = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke('googleWorkspace', { service: 'gmail', action: 'send', ...sendForm });
      setResult(res.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  const listEmails = async () => {
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('googleWorkspace', { service: 'gmail', action: 'list', q: searchQ, max: 10 });
      setMessages(res.data.messages || []);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode('send')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${mode === 'send' ? 'bg-[#1e40af]' : 'bg-white/5 hover:bg-white/10'}`}><Send className="w-4 h-4" /> Send</button>
        <button onClick={() => setMode('list')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${mode === 'list' ? 'bg-[#1e40af]' : 'bg-white/5 hover:bg-white/10'}`}><Inbox className="w-4 h-4" /> Inbox</button>
      </div>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      {mode === 'send' ? (
        <div className="space-y-3 max-w-lg">
          <input value={sendForm.to} onChange={e => setSendForm({...sendForm, to: e.target.value})} placeholder="To (email address)" className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
          <input value={sendForm.subject} onChange={e => setSendForm({...sendForm, subject: e.target.value})} placeholder="Subject" className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
          <textarea value={sendForm.html} onChange={e => setSendForm({...sendForm, html: e.target.value})} placeholder="HTML body" rows={6} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm font-mono" />
          <button onClick={sendEmail} disabled={loading || !sendForm.to || !sendForm.subject} className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1e40af] text-sm disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send via Gmail
          </button>
          {result && <p className="text-green-400 text-sm">Sent! Message ID: {result.message_id}</p>}
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-4">
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && listEmails()} placeholder="Search (e.g. from:someone@email.com)" className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
            <button onClick={listEmails} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1e40af] text-sm disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Load
            </button>
          </div>
          <div className="space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className="bg-[#1a1a1a] border border-white/10 rounded-md p-3">
                <p className="font-medium text-sm">{msg.subject}</p>
                <p className="text-xs text-gray-500 mt-1">From: {msg.from}</p>
                <p className="text-xs text-gray-600 mt-0.5">{msg.date}</p>
                <p className="text-xs text-gray-400 mt-1">{msg.snippet}</p>
              </div>
            ))}
            {messages.length === 0 && !loading && <p className="text-gray-500 text-sm">No emails loaded. Click Load to fetch.</p>}
          </div>
        </div>
      )}
    </div>
  );
}