import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Share2, Rocket, Bot, Package } from "lucide-react";

export default function Dashboard() {
  const [counts, setCounts] = useState({ websites: 0, social: 0, campaigns: 0, agents: 0, packs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [websites, social, campaigns, agents, packs] = await Promise.all([
          base44.entities.Website.count(),
          base44.entities.SocialPost.count(),
          base44.entities.LaunchCampaign.count(),
          base44.entities.Agent.count(),
          base44.entities.Pack.count(),
        ]);
        setCounts({ websites, social, campaigns, agents, packs });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    { label: "Websites", value: counts.websites, icon: Globe, path: "/websites", color: "text-blue-600" },
    { label: "Social Posts", value: counts.social, icon: Share2, path: "/social", color: "text-pink-600" },
    { label: "Launch Campaigns", value: counts.campaigns, icon: Rocket, path: "/launch", color: "text-orange-600" },
    { label: "Super Agents", value: counts.agents, icon: Bot, path: "/agents", color: "text-purple-600" },
    { label: "Packs Pending", value: counts.packs, icon: Package, path: "/packs", color: "text-teal-600" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Programmatic website factory and content automation</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Link to={card.path} key={card.label}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{loading ? "—" : card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}