import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, FolderOpen, Table, FileText, Calendar, CheckSquare, CheckCircle, XCircle, Loader2 } from "lucide-react";

const SERVICES = [
  { id: 'gmail', label: 'Gmail', icon: Mail, desc: 'Send & read emails' },
  { id: 'googledrive', label: 'Google Drive', icon: FolderOpen, desc: 'File storage & backup' },
  { id: 'googlesheets', label: 'Google Sheets', icon: Table, desc: 'Data backup spreadsheets' },
  { id: 'googledocs', label: 'Google Docs', icon: FileText, desc: 'Report documents' },
  { id: 'googlecalendar', label: 'Google Calendar', icon: Calendar, desc: 'Schedule & events' },
  { id: 'googletasks', label: 'Google Tasks', icon: CheckSquare, desc: 'Task management' },
];

export default function OverviewPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('googleWorkspace', { service: 'status' });
      setStatus(res.data.services);
    } catch (e) {
      setStatus(null);
    }
    setLoading(false);
  };

  useEffect(() => { checkStatus(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Connection Status</h2>
        <button onClick={checkStatus} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1e40af] text-sm hover:bg-[#1e40af]/80 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map(svc => {
          const st = status?.[svc.id];
          return (
            <div key={svc.id} className="bg-[#1a1a1a] rounded-lg border border-white/10 p-4">
              <div className="flex items-start justify-between mb-2">
                <svc.icon className="w-6 h-6 text-[#3b82f6]" />
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-gray-500" /> :
                  st?.connected ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
              </div>
              <h3 className="font-semibold text-sm">{svc.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{svc.desc}</p>
              {!loading && st && (
                <p className={`text-xs mt-2 ${st.connected ? 'text-green-400' : 'text-red-400'}`}>
                  {st.connected ? 'Connected & ready' : 'Not connected'}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-blue-500/20">
        <p className="text-sm text-gray-400">
          All 6 Google Workspace services are wired through OAuth connectors. These use your Google account tokens directly —
          they do NOT consume Base44 integration credits. Use the tabs above to send Gmail, browse Drive, create Sheets,
          schedule Calendar events, manage Tasks, and back up entity data to Google.
        </p>
      </div>
    </div>
  );
}