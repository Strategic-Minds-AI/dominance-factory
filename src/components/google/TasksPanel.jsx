import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, CheckSquare, Check } from "lucide-react";

export default function TasksPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', notes: '', due: '' });

  const createTask = async () => {
    setLoading(true); setError(null);
    try {
      await base44.functions.invoke('googleWorkspace', { service: 'tasks', action: 'create', ...form });
      setForm({ title: '', notes: '', due: '' });
      listTasks();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  const listTasks = async () => {
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('googleWorkspace', { service: 'tasks', action: 'list', show_completed: false });
      setTasks(res.data.tasks || []);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  const completeTask = async (id) => {
    try {
      await base44.functions.invoke('googleWorkspace', { service: 'tasks', action: 'complete', task_id: id });
      listTasks();
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

  React.useEffect(() => { listTasks(); }, []);

  return (
    <div>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">Create Task</h3>
          <div className="space-y-2">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title" className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Notes (optional)" rows={2} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
            <input value={form.due} onChange={e => setForm({...form, due: e.target.value})} placeholder="Due (ISO date)" className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
            <button onClick={createTask} disabled={loading || !form.title} className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1e40af] text-sm disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Task
            </button>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Your Tasks</h3>
            <button onClick={listTasks} disabled={loading} className="text-xs text-gray-400 hover:text-white">Refresh</button>
          </div>
          <div className="space-y-2">
            {tasks.map(t => (
              <div key={t.id} className="flex items-start gap-3 bg-[#1a1a1a] border border-white/10 rounded-md p-3">
                <button onClick={() => completeTask(t.id)} className="mt-0.5 text-gray-500 hover:text-green-400"><Check className="w-4 h-4" /></button>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.title}</p>
                  {t.notes && <p className="text-xs text-gray-500 mt-0.5">{t.notes}</p>}
                  {t.due && <p className="text-xs text-gray-600 mt-0.5">Due: {new Date(t.due).toLocaleDateString()}</p>}
                </div>
              </div>
            ))}
            {tasks.length === 0 && !loading && <p className="text-gray-500 text-sm">No open tasks.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}