import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, Network, BarChart3, Target, ArrowRight, BarChart2, Users, Crosshair, Settings, Globe } from "lucide-react";

export default function GodModeHome() {
  const globeRef = useRef(null);

  // Simple animated globe using canvas
  useEffect(() => {
    const canvas = globeRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let rotation = 0;

    const resize = () => {
      const size = canvas.parentElement.offsetWidth;
      canvas.width = size;
      canvas.height = size;
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes = Array.from({ length: 40 }, () => ({
      lat: (Math.random() - 0.5) * Math.PI,
      lon: Math.random() * Math.PI * 2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);

      // Outer glow
      const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.6);
      glow.addColorStop(0, "rgba(0, 212, 255, 0.15)");
      glow.addColorStop(0.5, "rgba(0, 212, 255, 0.05)");
      glow.addColorStop(1, "rgba(0, 212, 255, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Sphere base
      const sphereGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      sphereGrad.addColorStop(0, "#0d141e");
      sphereGrad.addColorStop(0.7, "#05070a");
      sphereGrad.addColorStop(1, "#02040a");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Rim light
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Meridian lines
      ctx.strokeStyle = "rgba(0, 212, 255, 0.12)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const meridianRot = rotation + (i / 8) * Math.PI;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * Math.abs(Math.cos(meridianRot)), r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Latitude lines
      for (let i = 1; i < 6; i++) {
        const lat = (i / 6 - 0.5) * Math.PI;
        const y = cy + Math.sin(lat) * r;
        const w2 = Math.cos(lat) * r;
        ctx.beginPath();
        ctx.ellipse(cx, y, w2, w2 * 0.15, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Nodes with connections
      const projected = nodes.map((n) => {
        const x = cx + Math.cos(n.lat) * Math.sin(n.lon + rotation) * r;
        const y = cy + Math.sin(n.lat) * r;
        const z = Math.cos(n.lat) * Math.cos(n.lon + rotation);
        return { x, y, z, pulse: n.pulse + rotation * 2 };
      });

      // Connection lines
      ctx.strokeStyle = "rgba(0, 212, 255, 0.2)";
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          if (a.z > 0 && b.z > 0) {
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < r * 0.5) {
              ctx.globalAlpha = (1 - dist / (r * 0.5)) * 0.3;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }
      ctx.globalAlpha = 1;

      // Node dots
      projected.forEach((p) => {
        if (p.z > 0) {
          const pulseSize = 2 + Math.sin(p.pulse) * 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 255, ${0.4 + p.z * 0.4})`;
          ctx.fill();
          // Glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseSize * 3, 0, Math.PI * 2);
          const nodeGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize * 3);
          nodeGlow.addColorStop(0, "rgba(0, 212, 255, 0.3)");
          nodeGlow.addColorStop(1, "rgba(0, 212, 255, 0)");
          ctx.fillStyle = nodeGlow;
          ctx.fill();
        }
      });

      rotation += 0.003;
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const leftPanels = [
    { label: "SEARCH", icon: "🔍", color: "#4285f4", thumb: "🏔️" },
    { label: "ANSWER", icon: "🤖", color: "#10a37f", thumb: "🏔️" },
    { label: "DISCOVER", icon: "▶️", color: "#ff0000", thumb: "🏔️" },
  ];

  const rightPanels = [
    { label: "EXPLORE", icon: "🅱️", color: "#00897b", thumb: "🏔️" },
    { label: "SHOP", icon: "🛍️", color: "#fbbc04", thumb: "🎧" },
    { label: "ENGAGE", icon: "💼", color: "#0a66c2", thumb: "🏔️" },
  ];

  const methodology = [
    { icon: Search, label: "Search" },
    { icon: BarChart3, label: "SEO" },
    { icon: Sparkles, label: "AEO" },
    { icon: Network, label: "GEO" },
    { icon: BarChart2, label: "Digital Growth Strategy" },
    { icon: Target, label: "Search & Discovery Visibility" },
  ];

  const footerCallouts = [
    { icon: BarChart2, label: "HIGHER VISIBILITY" },
    { icon: Users, label: "MORE QUALIFIED TRAFFIC" },
    { icon: Crosshair, label: "STRONGER BRAND AUTHORITY" },
    { icon: Settings, label: "REAL BUSINESS GROWTH" },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-white overflow-x-hidden relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#00d4ff]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#2eaaf7]/5 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex flex-col items-center pt-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-300 to-slate-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-xl font-black text-[#05070a]">A</span>
          </div>
          <h1 className="text-xl font-bold tracking-[0.2em] text-slate-200">STRATEGIC MINDS AI</h1>
        </div>
        <p className="text-[10px] tracking-[0.35em] text-slate-500 mt-2">INTELLIGENCE × VISIBILITY × REAL GROWTH</p>
      </header>

      {/* Hero */}
      <section className="relative z-10 text-center pt-8 pb-6">
        <h2 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-b from-white via-[#00d4ff] to-[#2eaaf7] bg-clip-text text-transparent leading-tight">
          AI-POWERED GROWTH
        </h2>
        <p className="text-lg md:text-xl text-slate-400 mt-3">More visibility, More opportunity.</p>
      </section>

      {/* Methodology row */}
      <section className="relative z-10 flex flex-wrap justify-center gap-6 md:gap-10 py-6 px-4">
        {methodology.map((m, i) => (
          <div key={i} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full border border-cyan-500/20 bg-white/5 flex items-center justify-center group-hover:border-cyan-400/50 group-hover:bg-cyan-500/10 transition-all">
              <m.icon className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[11px] tracking-wider text-slate-400">{m.label}</span>
          </div>
        ))}
      </section>

      {/* Central feature: Globe + Panels */}
      <section className="relative z-10 flex items-center justify-center gap-4 md:gap-12 py-8 px-4 max-w-6xl mx-auto">
        {/* Left panels */}
        <div className="hidden md:flex flex-col gap-4 w-48">
          {leftPanels.map((p, i) => (
            <GlassPanel key={i} {...p} />
          ))}
        </div>

        {/* Globe */}
        <div className="relative w-[280px] h-[280px] md:w-[380px] md:h-[380px] shrink-0">
          <canvas ref={globeRef} className="w-full h-full" />
        </div>

        {/* Right panels */}
        <div className="hidden md:flex flex-col gap-4 w-48">
          {rightPanels.map((p, i) => (
            <GlassPanel key={i} {...p} />
          ))}
        </div>
      </section>

      {/* Mobile panels */}
      <section className="md:hidden grid grid-cols-2 gap-3 px-4 max-w-md mx-auto">
        {[...leftPanels, ...rightPanels].map((p, i) => (
          <div key={i} className="rounded-xl border border-cyan-500/20 bg-white/5 backdrop-blur-md p-3 flex items-center gap-2">
            <span className="text-lg">{p.icon}</span>
            <span className="text-[11px] font-semibold tracking-wider text-slate-300">{p.label}</span>
          </div>
        ))}
      </section>

      {/* Central search input */}
      <section className="relative z-10 flex justify-center py-10 px-4">
        <Link
          to="/god-mode"
          className="group flex items-center gap-3 w-full max-w-xl rounded-full border border-cyan-500/30 bg-white/5 backdrop-blur-md px-6 py-4 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all"
        >
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-sm text-slate-300 flex-1">Smarter Search. Bigger Opportunities.</span>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#2eaaf7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ArrowRight className="w-5 h-5 text-[#05070a]" />
          </div>
        </Link>
      </section>

      {/* Footer callouts */}
      <footer className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 py-12 px-6 max-w-4xl mx-auto border-t border-white/5 mt-4">
        {footerCallouts.map((f, i) => (
          <div key={i} className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full border border-cyan-500/20 bg-white/5 flex items-center justify-center">
              <f.icon className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[11px] tracking-wider font-semibold text-slate-300">{f.label}</span>
          </div>
        ))}
      </footer>
    </div>
  );
}

function GlassPanel({ label, icon, color, thumb }) {
  return (
    <div className="rounded-xl border border-cyan-500/20 bg-white/5 backdrop-blur-md p-3 shadow-lg shadow-cyan-500/5 hover:border-cyan-400/40 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <span className="text-[10px] font-bold tracking-[0.15em] text-slate-300">{label}</span>
      </div>
      <div className="space-y-1.5 mb-2">
        <div className="h-1.5 rounded-full bg-white/10 w-full" />
        <div className="h-1.5 rounded-full bg-white/10 w-3/4" />
      </div>
      <div className="h-10 rounded-md bg-gradient-to-br from-slate-700/40 to-slate-900/40 flex items-center justify-center text-lg">
        {thumb}
      </div>
    </div>
  );
}