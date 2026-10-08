import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, Globe, ListChecks } from "lucide-react";

const agentStatusStyles = {
  idle: "bg-muted text-muted-foreground",
  running: "bg-blue-100 text-blue-700",
  paused: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
};

const taskStatusStyles = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function SuperAgents() {
  const [agents, setAgents] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [agentsPage, outletsPage, tasksPage] = await Promise.all([
          base44.entities.Agent.filter({}, { sort: "-created_date", limit: 50 }),
          base44.entities.MediaOutlet.filter({}, { sort: "-created_date", limit: 50 }),
          base44.entities.AgentTask.filter({}, { sort: "-created_date", limit: 50 }),
        ]);
        setAgents(agentsPage.items || []);
        setOutlets(outletsPage.items || []);
        setTasks(tasksPage.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Super Agents</h1>
          <p className="text-muted-foreground">Headless agents that post your business info across media outlets</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Add Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Agents
          </h2>
          {agents.length === 0 ? (
            <Card className="p-8 text-center">
              <Bot className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No agents connected yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {agents.map((a) => (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm">{a.name}</h3>
                      <Badge variant="outline" className={`text-xs ${agentStatusStyles[a.status] || agentStatusStyles.idle}`}>
                        {a.status}
                      </Badge>
                    </div>
                    {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                    <Badge variant="secondary" className="text-xs mt-2 capitalize">{a.agent_type?.replace("_", " ")}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Media Outlets
          </h2>
          {outlets.length === 0 ? (
            <Card className="p-8 text-center">
              <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No outlets added yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {outlets.map((o) => (
                <Card key={o.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{o.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{o.url}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize shrink-0">{o.outlet_type?.replace("_", " ")}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <ListChecks className="w-5 h-5" />
            Recent Tasks
          </h2>
          <div className="space-y-2">
            {tasks.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t.target_outlet}</p>
                    {t.result && <p className="text-xs text-muted-foreground truncate">{t.result}</p>}
                  </div>
                  <Badge variant="outline" className={`text-xs ${taskStatusStyles[t.status] || taskStatusStyles.pending}`}>
                    {t.status?.replace("_", " ")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}