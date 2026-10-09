import React, { useState } from "react";
import { Mail, FolderOpen, Table, Calendar, CheckSquare, Database, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import OverviewPanel from "@/components/google/OverviewPanel";
import GmailPanel from "@/components/google/GmailPanel";
import DrivePanel from "@/components/google/DrivePanel";
import SheetsPanel from "@/components/google/SheetsPanel";
import CalendarPanel from "@/components/google/CalendarPanel";
import TasksPanel from "@/components/google/TasksPanel";
import BackupPanel from "@/components/google/BackupPanel";

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'gmail', label: 'Gmail', icon: Mail },
  { id: 'drive', label: 'Drive', icon: FolderOpen },
  { id: 'sheets', label: 'Sheets', icon: Table },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'backup', label: 'Backup', icon: Database },
];

export default function GoogleWorkspace() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Google Workspace Hub</h1>
        <p className="text-sm text-gray-500 mb-6">Gmail, Drive, Sheets, Docs, Calendar & Tasks — all wired through your connected Google OAuth tokens. No Base44 credits consumed.</p>
        <div className="flex gap-1 mb-6 border-b border-white/10 pb-2 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-t-md text-sm font-medium transition-all whitespace-nowrap",
                tab === t.id ? "bg-[#1e40af] text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
        <div className="bg-[#111] rounded-lg border border-white/10 p-6">
          {tab === 'overview' && <OverviewPanel />}
          {tab === 'gmail' && <GmailPanel />}
          {tab === 'drive' && <DrivePanel />}
          {tab === 'sheets' && <SheetsPanel />}
          {tab === 'calendar' && <CalendarPanel />}
          {tab === 'tasks' && <TasksPanel />}
          {tab === 'backup' && <BackupPanel />}
        </div>
      </div>
    </div>
  );
}