import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

const MANDATORY = [
  { name: "Mobile-First Responsive Design", desc: "Every page renders flawlessly on mobile, tablet, and desktop" },
  { name: "HTTPS / SSL Security", desc: "Encrypted connections on every page, enforced via redirect" },
  { name: "Core Web Vitals (LCP, INP, CLS)", desc: "Sub-2.5s LCP, <200ms INP, <0.1 CLS on every page" },
  { name: "Structured Data (Schema.org)", desc: "JSON-LD markup for LocalBusiness, Service, FAQ, BreadcrumbList" },
  { name: "XML Sitemap & robots.txt", desc: "Auto-generated sitemap submitted to Google Search Console" },
  { name: "Canonical URLs", desc: "Self-referencing canonicals to prevent duplicate content" },
  { name: "Clean URL Structure", desc: "Human-readable, keyword-rich, hierarchical slugs" },
  { name: "Meta Title & Description", desc: "Unique, optimized, under character limits on every page" },
  { name: "Heading Hierarchy (H1-H6)", desc: "Single H1 per page, logical nesting, no skipped levels" },
  { name: "Image Alt Text & WebP", desc: "Descriptive alt attributes, next-gen image format, lazy loading" },
  { name: "Accessible HTML (WCAG)", desc: "Semantic HTML, ARIA labels, keyboard navigation, color contrast" },
  { name: "No Broken Links", desc: "Automated link checking, 301 redirects for changed URLs" },
];

const RECOMMENDED = [
  { name: "Programmatic Page Generation", desc: "Unique, high-quality content per location/service combination" },
  { name: "Local SEO (Google Business Profile)", desc: "NAP consistency, local schema, geo-targeted landing pages" },
  { name: "E-E-A-T Content Depth", desc: "Experience, Expertise, Authoritativeness, Trustworthiness signals" },
  { name: "Internal Linking Strategy", desc: "Topic clusters, pillar pages, contextual cross-links" },
  { name: "FAQ Schema", desc: "Question-answer format eligible for rich results" },
  { name: "Breadcrumb Navigation", desc: "BreadcrumbList schema + visible navigation" },
  { name: "Open Graph & Twitter Cards", desc: "Social sharing metadata on every page" },
  { name: "Server-Side Rendering", desc: "Pre-rendered HTML for crawlability and first-paint speed" },
  { name: "Crawl Budget Optimization", desc: "Thin content prevention, strategic noindex, faceted nav control" },
  { name: "Google Search Console", desc: "Sitemap submission, performance monitoring, indexation tracking" },
  { name: "Rich Results Eligibility", desc: "Schema markup for reviews, ratings, sitelinks, FAQs" },
  { name: "Fresh Content Signals", desc: "Regularly updated content, blog, news, seasonal pages" },
];

const AEO_GEO = [
  { name: "Conversational Q&A Blocks", desc: "Direct answer format optimized for voice and AI assistants" },
  { name: "Featured Snippet Optimization", desc: "40-60 word answer paragraphs, table/list formats" },
  { name: "Entity-Based Content", desc: "Knowledge graph entities, semantic relationships, linked data" },
  { name: "AI-Readable Structure", desc: "Semantic HTML, clear sections, machine-parseable content" },
  { name: "Author Authority Signals", desc: "Author schema, credentials, expertise indicators" },
  { name: "Generative Engine Citations", desc: "Content structured for AI models to parse, cite, and reference" },
];

export default function GoogleRequirements({ context, onComplete, onBack }) {
  const [aiStrategy, setAiStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const generateStrategy = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("onboardingAI", {
        action: "google_requirements",
        context,
      });
      const strategy = res?.requirements || res?.data?.requirements || null;
      if (strategy) {
        setAiStrategy(strategy);
      } else {
        setError("AI could not generate requirements. Try again.");
      }
    } catch (e) {
      setError(e.message || "Failed to generate requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateStrategy();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
          <ShieldCheck className="w-4 h-4" /> Step 3: Google Programmatic Requirements
        </div>
        <h2 className="text-xl font-bold text-white">Google Mandatory & Recommended Standards</h2>
        <p className="text-sm text-white/50 mt-1">
          Every website built by this system meets Google's mandatory requirements and implements recommended optimizations for fastest possible first-page rankings. The system targets SEO, AEO (Answer Engine), and GEO (Generative Engine) optimization.
        </p>
      </div>

      {/* Mandatory Requirements */}
      <Card className="p-5 bg-zinc-900 border-white/10">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" /> Mandatory Requirements (Google Standards)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {MANDATORY.map((req, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-green-500/5 border border-green-500/10">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">{req.name}</p>
                <p className="text-xs text-white/50">{req.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommended Optimizations */}
      <Card className="p-5 bg-zinc-900 border-white/10">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" /> Recommended Optimizations (Programmatic Scale)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {RECOMMENDED.map((req, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-blue-500/5 border border-blue-500/10">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">{req.name}</p>
                <p className="text-xs text-white/50">{req.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AEO / GEO Requirements */}
      <Card className="p-5 bg-zinc-900 border-white/10">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" /> AEO & GEO (Answer + Generative Engine Optimization)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {AEO_GEO.map((req, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-purple-500/5 border border-purple-500/10">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">{req.name}</p>
                <p className="text-xs text-white/50">{req.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI-Generated Business-Specific Strategy */}
      <Card className="p-5 bg-blue-500/5 border-blue-500/30">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" /> AI-Generated Strategy for Your Business
        </h3>
        {loading && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <p className="text-sm text-white/50">Analyzing your business and generating specific Google compliance strategy...</p>
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-4">
            <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-300 mb-3">{error}</p>
            <Button variant="outline" onClick={generateStrategy} className="border-white/10 text-white">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
          </div>
        )}
        {aiStrategy && !loading && (
          <div className="space-y-3">
            {aiStrategy.business_specific_strategy && (
              <p className="text-sm text-white/80 italic">{aiStrategy.business_specific_strategy}</p>
            )}
            {aiStrategy.mandatory_compliance?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Implementation Priority</p>
                {aiStrategy.mandatory_compliance.slice(0, 5).map((m, i) => (
                  <p key={i} className="text-sm text-white/70">• <span className="font-medium text-white">{m.requirement}</span> — {m.how_implemented}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="border-white/10 text-white/70 hover:bg-white/5">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onComplete} className="bg-blue-600 hover:bg-blue-500 text-white">
          Continue to Topics <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}