import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";

const ENTITIES = [
  "Website", "LaunchCampaign", "GeneratedPage", "Pack", "SocialPost",
  "PostSchedule", "SocialAccount", "MediaAsset", "ProgrammaticRule",
  "Agent", "AgentTask", "MediaOutlet", "OutreachCampaign",
  "ProvisioningJob", "SystemTemplate", "Opportunity", "Lead",
];

export default function EntityBrowser() {
  const [entityType, setEntityType] = useState("Website");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [editJson, setEditJson] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = {};
      if (searchQuery) {
        query.name = { $regex: searchQuery, $options: "i" };
      }
      const page = await base44.entities[entityType].filter(query, {
        sort: "-created_date",
        limit: 50,
      });
      setRecords(page.items || []);
    } catch (e) {
      setError(e.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, searchQuery]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleCreate = () => {
    setEditing({ _new: true });
    setEditJson("{\n  \n}");
  };

  const handleEdit = (record) => {
    const { id, created_date, updated_date, created_by_id, ...rest } = record;
    setEditing(record);
    setEditJson(JSON.stringify(rest, null, 2));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const data = JSON.parse(editJson);
      if (editing?._new) {
        await base44.entities[entityType].create(data);
      } else {
        await base44.entities[entityType].update(editing.id, data);
      }
      setEditing(null);
      setEditJson("");
      loadRecords();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete this ${entityType} record?`)) return;
    try {
      await base44.entities[entityType].delete(record.id);
      loadRecords();
    } catch (e) {
      setError(e.message);
    }
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "boolean") return val ? "✓" : "✗";
    if (typeof val === "string" && val.length > 80) return val.substring(0, 80) + "...";
    if (typeof val === "object") return JSON.stringify(val).substring(0, 80) + "...";
    return String(val);
  };

  const columns = records.length > 0
    ? Object.keys(records[0]).filter((k) => !["html_content", "preview_html", "content_markdown"].includes(k)).slice(0, 8)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITIES.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
          className="w-48"
        />
        <Button variant="outline" size="sm" onClick={loadRecords} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </Button>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="w-4 h-4" /> New Record
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No {entityType} records found.</Card>
      ) : (
        <div className="border rounded-lg overflow-auto max-h-[60vh]">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="text-left px-3 py-2 font-medium whitespace-nowrap">{col}</th>
                ))}
                <th className="text-right px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t hover:bg-muted/50">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-2 whitespace-nowrap max-w-48 truncate" title={String(record[col] ?? "")}>
                      {formatValue(record[col])}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(record)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => handleDelete(record)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">Showing {records.length} records (max 50). Use search to filter by name.</p>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?._new ? `New ${entityType}` : `Edit ${entityType}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Record Data (JSON)</Label>
            <Textarea
              value={editJson}
              onChange={(e) => setEditJson(e.target.value)}
              className="font-mono text-xs min-h-[300px]"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}