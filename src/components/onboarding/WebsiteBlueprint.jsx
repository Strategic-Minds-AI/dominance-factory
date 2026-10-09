import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, ArrowRight, ArrowLeft, CheckCircle2, Shield, Users, Share2, Bot, MessageSquare, Search } from "lucide-react";

const BLUEPRINT = [
  {
    icon: Shield,
    title: "Admin Portal",
    desc: "Full access for the admin creator to edit, manage, deploy, and control every aspect of the website. Includes content editor, design controls, deployment settings, and system configuration.",
    features: ["Content Management", "Design Controls", "Deployment Settings", "System Configuration", "Secret Management", "Full Read/Write/Execute"],
  },
  {
    icon: Users,
    title: "Client Portal",
    desc: "An operating system for the business owner. Manage their website, business operations, social media, digital assets, and communications from one dashboard.",
    features: ["Business Dashboard", "Social Media Manager", "Digital Asset Library", "Communication Hub", "Analytics & Reports", "Booking & Scheduling"],
  },
  {
    icon: Share2,
    title: "Automated Social Media System",
    desc: "Fully automated social media management: posting, video creation, image creation, AI engagement with users, and communication with followers across all platforms.",
    features: ["Auto-Posting (Facebook, Instagram, X, LinkedIn, TikTok, YouTube)", "Automated Video Creation", "Automated Image Generation", "AI Comment Engagement", "AI DM Responses", "Content Calendar & Scheduling"],
  },
  {
    icon: Bot,
    title: "Autonomous Super Agents",
    desc: "Each site comes with autonomous super agents capable of operating the website and business end-to-end: content creation, SEO optimization, social media, customer service, and lead generation.",
    features: ["Content Agent (writes & publishes)", "SEO Agent (optimizes & monitors)", "Social Agent (posts & engages)", "Support Agent (answers customers)", "Sales Agent (follows up leads)", "Operations Agent (manages workflows)"],
  },
  {
    icon: MessageSquare,
    title: "AI Chat Orchestrator Agent",
    desc: "An autonomous AI chat agent with full read/write/execute access to both frontend and backend. The admin and owner can instruct it in natural language to edit, add, delete, and operate the entire site end-to-end.",
    features: ["Natural Language Commands", "Full Frontend Edit Access", "Full Backend Write Access", "Entity CRUD Operations", "Function Execution", "Secret Configuration", "End-to-End Site Operation"],
  },
  {
    icon: Search,
    title: "SEO / AEO / GEO Engine",
    desc: "Built-in Google programmatic compliance: mandatory requirements, recommended optimizations, answer engine optimization, and generative engine optimization on every page automatically.",
    features: ["Mandatory Google Compliance", "Programmatic Page Generation", "Local SEO & Schema Markup", "AEO (Answer Engine Optimization)", "GEO (Generative Engine Optimization)", "Core Web Vitals Monitoring"],
  },
];

export default function WebsiteBlueprint({ onComplete, onBack }) {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
          <LayoutGrid className="w-4 h-4" /> Step 6: Standard Website Blueprint
        </div>
        <h2 className="text-xl font-bold text-white">Every Website Comes Standard With</h2>
        <p className="text-sm text-white/50 mt-1">
          Every website built by this system — whether 1 or 1,000,000 — comes with the same standard architecture: admin portal, client portal, automated social media, super agents, AI chat orchestrator, and full SEO/AEO/GEO compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BLUEPRINT.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className="p-5 bg-zinc-900 border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <Badge variant="outline" className="text-xs text-green-400 border-green-500/30 mt-0.5">Included Standard</Badge>
                </div>
              </div>
              <p className="text-xs text-white/50 mb-3">{item.desc}</p>
              <div className="space-y-1">
                {item.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/70">{f}</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 bg-blue-500/5 border-blue-500/30">
        <h3 className="text-sm font-semibold text-white mb-2">Scale Architecture</h3>
        <p className="text-sm text-white/70">
          This blueprint is deployed identically whether building a single site or millions. Each site is provisioned as an independent instance with its own admin portal, client portal, agents, social media accounts, and SEO engine — all managed centrally from ApexForge.
        </p>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="border-white/10 text-white/70 hover:bg-white/5">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onComplete} className="bg-blue-600 hover:bg-blue-500 text-white">
          Continue to Contents & Gap Analysis <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}