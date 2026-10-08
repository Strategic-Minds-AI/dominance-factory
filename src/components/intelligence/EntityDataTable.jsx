import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, Database } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function EntityDataTable({ entityName, columns, searchFields, title }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const query = search && searchFields?.length > 0
        ? { $or: searchFields.map(f => ({ [f]: { $regex: search, $options: "i" } })) }
        : {};
      const { items } = await base44.entities[entityName].filter(query, { sort: "-created_date", limit: 100 });
      setRecords(items || []);
    } catch (e) {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [entityName, search, searchFields]);

  useEffect(() => {
    const timer = setTimeout(loadData, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4">
        <h3 className="text-lg font-semibold shrink-0">{title}</h3>
        <div className="relative w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9"
          />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Database className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No records yet. Use the Import button on each file to populate this table.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  {columns.map(col => (
                    <th key={col.key} className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record, i) => (
                  <tr key={record.id || i} className="border-t border-border hover:bg-muted/30">
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-2 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                        {col.render ? col.render(record) : (record[col.key] != null ? String(record[col.key]) : "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{records.length} records loaded</p>
        </>
      )}
    </div>
  );
}