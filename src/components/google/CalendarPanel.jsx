import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Calendar, Plus, Link } from "lucide-react";

export default function CalendarPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ summary: '', description: '', start: '', end: '', attendees: '' });

  const createEvent = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const attendees = form.attendees ? form.attendees.split(',').map(s => s.trim()).filter(Boolean) : [];
      const res = await base44.functions.invoke('googleWorkspace', {
        service: 'calendar', action: 'create',
        summary: form.summary, description: form.description,
        start: form.start, end: form.end || form.start, attendees,
      });
      setResult(res.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  const listEvents = async () => {
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('googleWorkspace', { service: 'calendar', action: 'list', max: 10 });
      setEvents(res.data.events || []);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  return (
    <div>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">Create Event</h3>
          <div className="space-y-2">
            <input value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} placeholder="Event title" className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" rows={2} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
            <input value={form.start} onChange={e => setForm({...form, start: e.target.value})} placeholder="Start (ISO: 2026-10-10T14:00:00)" className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
            <input value={form.end} onChange={e => setForm({...form, end: e.target.value})} placeholder="End (optional)" className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
            <input value={form.attendees} onChange={e => setForm({...form, attendees: e.target.value})} placeholder="Attendees (comma-separated emails)" className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
            <button onClick={createEvent} disabled={loading || !form.summary || !form.start} className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1e40af] text-sm disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Event
            </button>
          </div>
          {result && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <p className="text-green-400 text-sm">Event created!</p>
              {result.html_link && <a href={result.html_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 text-xs hover:underline mt-1"><Link className="w-3 h-3" /> Open in Google Calendar</a>}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Upcoming Events</h3>
            <button onClick={listEvents} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs disabled:opacity-50">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />} Load
            </button>
          </div>
          <div className="space-y-2">
            {events.map(ev => (
              <div key={ev.id} className="bg-[#1a1a1a] border border-white/10 rounded-md p-3">
                <p className="text-sm font-medium">{ev.summary}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(ev.start).toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
                {ev.html_link && <a href={ev.html_link} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Open</a>}
              </div>
            ))}
            {events.length === 0 && !loading && <p className="text-gray-500 text-sm">No events loaded.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}