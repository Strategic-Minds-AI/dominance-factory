import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Loader2, Video, Image as ImageIcon, Calendar, Bot, Zap, Play, Hash, Film, CheckCircle2, Sparkles } from "lucide-react";
import { getSession } from "@/lib/strategySession";

export default function SocialMediaAutomation() {
  const session = getSession();
  const [industry, setIndustry] = useState(session.industry || "");
  const [businessName, setBusinessName] = useState(session.business_name || "");
  const [platforms, setPlatforms] = useState("facebook, instagram, twitter, linkedin, tiktok");

  // 30-day content
  const [calendar, setCalendar] = useState(null);
  const [loading30, setLoading30] = useState(false);
  const [error30, setError30] = useState("");

  // Video templates
  const [templates, setTemplates] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Video script
  const [videoScript, setVideoScript] = useState(null);
  const [loadingScript, setLoadingScript] = useState(false);

  // Social image
  const [imageUrls, setImageUrls] = useState([]);
  const [imagePrompt, setImagePrompt] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);

  // Agent plan
  const [agentPlan, setAgentPlan] = useState(null);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const create30Day = async () => {
    setLoading30(true);
    setError30("");
    try {
      const res = await base44.functions.invoke("socialMediaEngine", {
        action: "create_30_day_content",
        industry, business_name: businessName, platforms,
      });
      setCalendar(res.data || res);
    } catch (e) { setError30(e.message); }
    setLoading30(false);
  };

  const findTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await base44.functions.invoke("socialMediaEngine", { action: "find_video_templates", industry });
      setTemplates(res.data || res);
    } catch (e) { setError30(e.message); }
    setLoadingTemplates(false);
  };

  const generateScript = async (templateName) => {
    setLoadingScript(true);
    try {
      const res = await base44.functions.invoke("socialMediaEngine", {
        action: "generate_video_script",
        industry, business_name: businessName, template: templateName,
      });
      setVideoScript(res.data || res);
    } catch (e) { setError30(e.message); }
    setLoadingScript(false);
  };

  const generateImage = async () => {
    setLoadingImage(true);
    try {
      const res = await base44.functions.invoke("socialMediaEngine", {
        action: "generate_social_image",
        prompt: imagePrompt, platform: "instagram",
      });
      setImageUrls(res.data?.urls || res.urls || []);
    } catch (e) { setError30(e.message); }
    setLoadingImage(false);
  };

  const createAgentPlan = async () => {
    setLoadingAgents(true);
    try {
      const res = await base44.functions.invoke("socialMediaEngine", {
        action: "create_autonomous_agent_plan",
        industry, business_name: businessName, website_count: 100,
      });
      setAgentPlan(res.data || res);
    } catch (e) { setError30(e.message); }
    setLoadingAgents(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <Share2 className="w-4 h-4" /> Fully Autonomous Social Media System
          </div>
          <h1 className="text-2xl font-bold text-white">Social Media Automation Engine</h1>
          <p className="text-sm text-white/50 mt-2 max-w-3xl mx-auto">
            30-day content creator with hashtags, NearMe video template system, image/video generators, autonomous scheduling/posting/commenting agent, and super agent deployment for end-to-end autonomous operation.
          </p>
        </div>

        {/* Context */}
        <Card className="p-4 bg-zinc-900 border-white/10">
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-white/70 mb-1 block text-xs">Industry</Label><Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Roofing" className="bg-white/5 border-white/10 text-white h-8 text-sm" /></div>
            <div><Label className="text-white/70 mb-1 block text-xs">Business Name</Label><Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g., Apex Roofing" className="bg-white/5 border-white/10 text-white h-8 text-sm" /></div>
            <div><Label className="text-white/70 mb-1 block text-xs">Platforms</Label><Input value={platforms} onChange={(e) => setPlatforms(e.target.value)} className="bg-white/5 border-white/10 text-white h-8 text-sm" /></div>
          </div>
        </Card>

        {error30 && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{error30}</div>}

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid grid-cols-5 bg-zinc-900 border border-white/10">
            <TabsTrigger value="content" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-blue-600/20 text-xs"><Calendar className="w-3 h-3 mr-1" /> 30-Day</TabsTrigger>
            <TabsTrigger value="video" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-blue-600/20 text-xs"><Film className="w-3 h-3 mr-1" /> Video NearMe</TabsTrigger>
            <TabsTrigger value="image" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-blue-600/20 text-xs"><ImageIcon className="w-3 h-3 mr-1" /> Image Gen</TabsTrigger>
            <TabsTrigger value="script" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-blue-600/20 text-xs"><Video className="w-3 h-3 mr-1" /> Script</TabsTrigger>
            <TabsTrigger value="agents" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-blue-600/20 text-xs"><Bot className="w-3 h-3 mr-1" /> Agents</TabsTrigger>
          </TabsList>

          {/* 30-Day Content */}
          <TabsContent value="content" className="mt-4">
            <Card className="p-6 bg-zinc-900 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> 30-Day Content Creator</h3>
                <Button onClick={create30Day} disabled={loading30 || !industry} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                  {loading30 ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
                  {loading30 ? "Generating..." : "Generate 30 Days"}
                </Button>
              </div>
              {calendar?.calendar?.length > 0 ? (
                <>
                  {calendar.strategy_summary && <p className="text-xs text-white/60 mb-3 p-2 rounded bg-blue-500/10 border border-blue-500/20">{calendar.strategy_summary}</p>}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {calendar.calendar.map((day, i) => (
                      <div key={i} className="p-3 rounded-md bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">Day {day.day}</Badge>
                            <span className="text-xs text-white/50">{day.date}</span>
                          </div>
                          <p className="text-xs font-medium text-white">{day.theme}</p>
                        </div>
                        {day.posts?.map((post, j) => (
                          <div key={j} className="ml-4 mb-1.5 p-2 rounded bg-white/5">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Badge variant="outline" className="text-xs text-white/50 border-white/20">{post.platform}</Badge>
                              <span className="text-xs text-white/40">{post.best_time}</span>
                              <Badge className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/20">{post.content_type}</Badge>
                            </div>
                            <p className="text-xs text-white/70">{post.text?.slice(0, 150)}...</p>
                            {post.hashtags && <p className="text-xs text-blue-400 mt-0.5">{post.hashtags.join(" ")}</p>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8"><Calendar className="w-8 h-8 text-white/20 mx-auto mb-2" /><p className="text-xs text-white/40">Generate 30 days of platform-optimized content with hashtags</p></div>
              )}
            </Card>
          </TabsContent>

          {/* Video NearMe Templates */}
          <TabsContent value="video" className="mt-4">
            <Card className="p-6 bg-zinc-900 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Film className="w-4 h-4 text-purple-400" /> NearMe Video Template System</h3>
                <Button onClick={findTemplates} disabled={loadingTemplates || !industry} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                  {loadingTemplates ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Film className="w-3 h-3 mr-1" />}
                  {loadingTemplates ? "Finding..." : "Find Templates"}
                </Button>
              </div>
              <p className="text-xs text-white/50 mb-4">Finds the top 10 trending video templates and adapts them for NearMe local business videos.</p>
              {templates?.templates?.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {templates.templates.map((t, i) => (
                    <div key={i} className="p-3 rounded-md bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-white">{t.name}</p>
                        <div className="flex gap-1.5">
                          <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">{t.duration}</Badge>
                          <Badge variant="outline" className="text-xs text-white/50 border-white/20">{t.platform}</Badge>
                          <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30">{t.est_views}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-white/60 mb-1">{t.why_viral}</p>
                      <p className="text-xs text-yellow-400">Hook: {t.hook}</p>
                      <p className="text-xs text-blue-400 mt-1">NearMe: {t.nearme_adaptation}</p>
                      <Button onClick={() => generateScript(t.name)} disabled={loadingScript} size="sm" variant="outline" className="mt-2 text-xs text-white/70 border-white/20">
                        {loadingScript ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
                        Generate Script
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8"><Film className="w-8 h-8 text-white/20 mx-auto mb-2" /><p className="text-xs text-white/40">Find trending video templates adapted for NearMe</p></div>
              )}
            </Card>
          </TabsContent>

          {/* Image Generator */}
          <TabsContent value="image" className="mt-4">
            <Card className="p-6 bg-zinc-900 border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><ImageIcon className="w-4 h-4 text-green-400" /> Social Media Image Generator</h3>
              <div className="flex gap-3 mb-4">
                <Input value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder="e.g., Professional roofing team installing shingles on a sunny day, high quality, Instagram format" className="bg-white/5 border-white/10 text-white" />
                <Button onClick={generateImage} disabled={loadingImage || !imagePrompt} className="bg-green-600 hover:bg-green-500 text-white shrink-0">
                  {loadingImage ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                  {loadingImage ? "Generating..." : "Generate"}
                </Button>
              </div>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {imageUrls.map((url, i) => (
                    <img key={i} src={url} alt="Generated" className="w-full rounded-lg border border-white/10" />
                  ))}
                </div>
              )}
              {!imageUrls.length && <div className="text-center py-8"><ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" /><p className="text-xs text-white/40">Generate social media images via Vercel AI Gateway</p></div>}
            </Card>
          </TabsContent>

          {/* Video Script */}
          <TabsContent value="script" className="mt-4">
            <Card className="p-6 bg-zinc-900 border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Video className="w-4 h-4 text-red-400" /> NearMe Video Script</h3>
              {videoScript?.script ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Hook (0-3s)</p>
                    <p className="text-sm text-white">{videoScript.script.hook}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10"><p className="text-xs text-white/40 uppercase mb-1">Intro</p><p className="text-xs text-white/70">{videoScript.script.intro}</p></div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10"><p className="text-xs text-white/40 uppercase mb-1">NearMe Call-out</p><p className="text-xs text-white/70">{videoScript.script.nearme_callout}</p></div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10"><p className="text-xs text-white/40 uppercase mb-1">Main Content</p><p className="text-xs text-white/70">{videoScript.script.main_content}</p></div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10"><p className="text-xs text-white/40 uppercase mb-1">Social Proof</p><p className="text-xs text-white/70">{videoScript.script.social_proof}</p></div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"><p className="text-xs text-green-400 uppercase tracking-wider mb-1">CTA</p><p className="text-sm text-white">{videoScript.script.cta}</p></div>
                  {videoScript.scenes?.length > 0 && (
                    <div><p className="text-xs text-white/40 uppercase tracking-wider mb-2">Scene Breakdown</p>
                      <div className="space-y-1">{videoScript.scenes.map((s, i) => (
                        <div key={i} className="flex gap-2 text-xs p-1.5 rounded bg-white/5"><span className="text-white/40 font-mono">{s.scene}</span><span className="text-white/60">{s.visual}</span><span className="text-white/40">{s.duration}</span></div>
                      ))}</div>
                    </div>
                  )}
                  <div className="flex gap-3"><p className="text-xs text-white/50">Music: {videoScript.music}</p><p className="text-xs text-white/50">Duration: {videoScript.total_duration}</p></div>
                  {videoScript.hashtags && <p className="text-xs text-blue-400">{videoScript.hashtags.join(" ")}</p>}
                </div>
              ) : (
                <div className="text-center py-8"><Video className="w-8 h-8 text-white/20 mx-auto mb-2" /><p className="text-xs text-white/40">Go to the Video NearMe tab to find templates and generate scripts</p></div>
              )}
            </Card>
          </TabsContent>

          {/* Autonomous Agents */}
          <TabsContent value="agents" className="mt-4">
            <Card className="p-6 bg-zinc-900 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Bot className="w-4 h-4 text-purple-400" /> Autonomous Super Agent Plan</h3>
                <Button onClick={createAgentPlan} disabled={loadingAgents || !industry} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                  {loadingAgents ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Bot className="w-3 h-3 mr-1" />}
                  {loadingAgents ? "Planning..." : "Create Plan"}
                </Button>
              </div>
              <p className="text-xs text-white/50 mb-4">Designs a complete super agent system that autonomously operates websites, social media, customer communication, A/B testing, and analytics — end-to-end without human intervention.</p>
              {agentPlan?.agents?.length > 0 ? (
                <div className="space-y-3">
                  {agentPlan.agents.map((agent, i) => (
                    <div key={i} className="p-3 rounded-md bg-purple-500/5 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <div><span className="text-xs font-mono text-purple-400">{agent.id}</span><p className="text-sm font-bold text-white">{agent.name}</p></div>
                        <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">{agent.schedule}</Badge>
                      </div>
                      <p className="text-xs text-white/60 mb-1">{agent.role}</p>
                      {agent.responsibilities?.map((r, j) => <p key={j} className="text-xs text-white/50 ml-2">• {r}</p>)}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {agent.tools?.map((t, j) => <Badge key={j} variant="outline" className="text-xs text-white/40 border-white/20">{t}</Badge>)}
                      </div>
                    </div>
                  ))}
                  {agentPlan.orchestration && <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"><p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Orchestration</p><p className="text-xs text-white/70">{agentPlan.orchestration}</p></div>}
                  {agentPlan.autonomous_workflow && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"><p className="text-xs text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Autonomous Workflow</p><p className="text-xs text-white/70">{agentPlan.autonomous_workflow}</p></div>}
                </div>
              ) : (
                <div className="text-center py-8"><Bot className="w-8 h-8 text-white/20 mx-auto mb-2" /><p className="text-xs text-white/40">Design the autonomous super agent system</p></div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}