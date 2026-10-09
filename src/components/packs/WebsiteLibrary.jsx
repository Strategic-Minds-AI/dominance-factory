import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Copy, Check, Code2, Palette, Layout, Type, Sparkles,
  Layers, BookOpen, Zap, Shield, Globe
} from 'lucide-react';

const ENDPOINT_URL = 'https://build-scale-dominate.base44.app/functions/ingestPack';

// ── API Schema ───────────────────────────────────────────────
const API_SCHEMA = `{
  "sync_token": "<PACK_SYNC_TOKEN>",     // required — matches your secret
  "name": "Plumber Landing — Austin TX", // required — human-readable label
  "kind": "web_pack",                     // web_pack | landing_page | full_site
  "preview_html": "<!doctype html>…",     // required — complete, self-contained HTML
  "brand_tokens": "{ \\"colors\\": {…}, \\"fonts\\": {…} }", // JSON string
  "source": "gpt_sync",                   // gpt_sync | manual | api
  "submitted_by_label": "GPT",            // who/what created it
  "metadata": "{ \\"niche\\": \\"plumbing\\", \\"city\\": \\"Austin\\" }" // optional JSON string
}`;

// ── Brand Token Schema ───────────────────────────────────────
const BRAND_TOKENS = `{
  "colors": {
    "primary": "#0a0a0a",
    "primary_foreground": "#ffffff",
    "accent": "#3b82f6",
    "background": "#ffffff",
    "muted": "#f5f5f5",
    "text": "#0a0a0a",
    "border": "#e5e7eb"
  },
  "fonts": {
    "heading": "Inter, system-ui, sans-serif",
    "body": "Inter, system-ui, sans-serif",
    "mono": "ui-monospace, monospace"
  },
  "radius": "8px",
  "shadow": "0 4px 24px rgba(0,0,0,0.08)",
  "max_width": "1200px"
}`;

// ── HTML Scaffold ────────────────────────────────────────────
const HTML_SCAFFOLD = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="PAGE DESCRIPTION HERE" />
  <title>PAGE TITLE — Brand Name</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --primary:#0a0a0a;--accent:#3b82f6;--bg:#fff;--muted:#f5f5f5;
      --text:#0a0a0a;--border:#e5e7eb;--radius:8px;--max:1200px;
    }
    body{font-family:Inter,system-ui,sans-serif;color:var(--text);background:var(--bg);line-height:1.6}
    .container{max-width:var(--max);margin:0 auto;padding:0 24px}
    a{color:inherit;text-decoration:none}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:var(--radius);
      font-weight:700;font-size:16px;transition:transform .15s,opacity .15s}
    .btn-primary{background:var(--primary);color:#fff}
    .btn-primary:hover{opacity:.9;transform:translateY(-1px)}
    .btn-outline{border:2px solid var(--border);color:var(--text)}
    section{padding:80px 0}
    h1{font-size:clamp(36px,6vw,64px);line-height:1.05;font-weight:800;letter-spacing:-0.03em}
    h2{font-size:clamp(28px,4vw,42px);line-height:1.1;font-weight:800;letter-spacing:-0.02em}
    h3{font-size:22px;font-weight:700}
    .muted{color:#737373}
    .grid{display:grid;gap:24px}
    @media(min-width:768px){.grid-2{grid-template-columns:repeat(2,1fr)}.grid-3{grid-template-columns:repeat(3,1fr)}.grid-4{grid-template-columns:repeat(4,1fr)}}
  </style>
</head>
<body>
  <!-- NAV -->
  <nav class="container" style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px">
    <strong>Brand</strong>
    <div style="display:flex;gap:32px;align-items:center">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a class="btn btn-primary" href="#cta">Get Started</a>
    </div>
  </nav>

  <!-- HERO -->
  <section style="text-align:center;padding:120px 0 80px">
    <div class="container">
      <h1>Your Headline Here</h1>
      <p class="muted" style="font-size:20px;max-width:600px;margin:24px auto 40px">
        Supporting subheadline that explains the value proposition clearly.
      </p>
      <a class="btn btn-primary" href="#cta">Primary CTA →</a>
    </div>
  </section>

  <!-- FEATURES -->
  <section id="features" style="background:var(--muted)">
    <div class="container">
      <h2 style="text-align:center;margin-bottom:16px">Why Choose Us</h2>
      <p class="muted" style="text-align:center;margin-bottom:48px">Three reasons customers pick you.</p>
      <div class="grid grid-3">
        <!-- Feature cards -->
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section id="pricing">
    <div class="container">
      <h2 style="text-align:center;margin-bottom:48px">Simple Pricing</h2>
      <div class="grid grid-3">
        <!-- Pricing cards -->
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section id="cta" style="background:var(--primary);color:#fff;text-align:center">
    <div class="container">
      <h2>Ready to Get Started?</h2>
      <p style="opacity:.8;margin:16px 0 32px">Join thousands of happy customers.</p>
      <a class="btn" href="#" style="background:#fff;color:var(--primary)">Start Free →</a>
    </div>
  </section>

  <!-- FOOTER -->
  <footer style="padding:48px 0;border-top:1px solid var(--border)">
    <div class="container" style="display:flex;justify-content:space-between;align-items:center">
      <small class="muted">© 2026 Brand Name. All rights reserved.</small>
      <div style="display:flex;gap:24px"><a href="#">Privacy</a><a href="#">Terms</a></div>
    </div>
  </footer>
</body>
</html>`;

// ── Section Library ──────────────────────────────────────────
const SECTIONS = [
  {
    id: 'hero-centered',
    name: 'Hero — Centered',
    icon: Sparkles,
    html: `<section style="text-align:center;padding:120px 0 80px">
  <div class="container">
    <span style="display:inline-block;padding:6px 16px;border-radius:99px;background:var(--muted);font-size:13px;font-weight:600;margin-bottom:24px">Badge Text</span>
    <h1>The Fastest Way to <span style="color:var(--accent)">Grow Your Business</span></h1>
    <p class="muted" style="font-size:20px;max-width:600px;margin:24px auto 40px">Subheadline explaining the core benefit in one sentence.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
      <a class="btn btn-primary" href="#cta">Start Free Trial</a>
      <a class="btn btn-outline" href="#demo">Watch Demo</a>
    </div>
  </div>
</section>`
  },
  {
    id: 'hero-split',
    name: 'Hero — Split (Image Right)',
    icon: Layout,
    html: `<section style="padding:100px 0">
  <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
    <div>
      <h1>Headline That Grabs Attention</h1>
      <p class="muted" style="font-size:18px;margin:20px 0 32px">Subheadline with supporting detail.</p>
      <a class="btn btn-primary" href="#cta">Get Started →</a>
    </div>
    <div style="border-radius:var(--radius);overflow:hidden;aspect-ratio:4/3;background:var(--muted)">
      <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800" alt="Dashboard" style="width:100%;height:100%;object-fit:cover" />
    </div>
  </div>
</section>`
  },
  {
    id: 'features-grid',
    name: 'Features — 3 Column Grid',
    icon: Layers,
    html: `<section id="features" style="background:var(--muted)">
  <div class="container">
    <h2 style="text-align:center;margin-bottom:48px">Everything You Need</h2>
    <div class="grid grid-3">
      <div style="background:#fff;padding:32px;border-radius:var(--radius);border:1px solid var(--border)">
        <div style="width:48px;height:48px;border-radius:12px;background:var(--accent);display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:24px">⚡</div>
        <h3>Feature One</h3>
        <p class="muted" style="margin-top:8px">Description of the first key feature and its benefit.</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:var(--radius);border:1px solid var(--border)">
        <div style="width:48px;height:48px;border-radius:12px;background:var(--accent);display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:24px">🔒</div>
        <h3>Feature Two</h3>
        <p class="muted" style="margin-top:8px">Description of the second key feature and its benefit.</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:var(--radius);border:1px solid var(--border)">
        <div style="width:48px;height:48px;border-radius:12px;background:var(--accent);display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:24px">📊</div>
        <h3>Feature Three</h3>
        <p class="muted" style="margin-top:8px">Description of the third key feature and its benefit.</p>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 'pricing-3col',
    name: 'Pricing — 3 Tier',
    icon: Zap,
    html: `<section id="pricing">
  <div class="container">
    <h2 style="text-align:center;margin-bottom:48px">Pricing That Scales With You</h2>
    <div class="grid grid-3">
      <!-- Starter -->
      <div style="padding:32px;border-radius:var(--radius);border:1px solid var(--border)">
        <h3>Starter</h3>
        <p class="muted" style="font-size:14px">For individuals</p>
        <div style="font-size:48px;font-weight:800;margin:20px 0">$0<span style="font-size:16px;font-weight:400" class="muted">/mo</span></div>
        <a class="btn btn-outline" href="#" style="width:100%;justify-content:center">Get Started</a>
        <ul style="list-style:none;margin-top:24px;display:flex;flex-direction:column;gap:12px">
          <li>✓ 1 project</li><li>✓ Basic analytics</li><li>✓ Email support</li>
        </ul>
      </div>
      <!-- Pro (highlighted) -->
      <div style="padding:32px;border-radius:var(--radius);border:2px solid var(--primary);position:relative">
        <span style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;padding:4px 16px;border-radius:99px;font-size:12px;font-weight:700">POPULAR</span>
        <h3>Pro</h3>
        <p class="muted" style="font-size:14px">For growing teams</p>
        <div style="font-size:48px;font-weight:800;margin:20px 0">$29<span style="font-size:16px;font-weight:400" class="muted">/mo</span></div>
        <a class="btn btn-primary" href="#" style="width:100%;justify-content:center">Start Free Trial</a>
        <ul style="list-style:none;margin-top:24px;display:flex;flex-direction:column;gap:12px">
          <li>✓ Unlimited projects</li><li>✓ Advanced analytics</li><li>✓ Priority support</li><li>✓ Custom branding</li>
        </ul>
      </div>
      <!-- Enterprise -->
      <div style="padding:32px;border-radius:var(--radius);border:1px solid var(--border)">
        <h3>Enterprise</h3>
        <p class="muted" style="font-size:14px">For large orgs</p>
        <div style="font-size:48px;font-weight:800;margin:20px 0">Custom</div>
        <a class="btn btn-outline" href="#" style="width:100%;justify-content:center">Contact Sales</a>
        <ul style="list-style:none;margin-top:24px;display:flex;flex-direction:column;gap:12px">
          <li>✓ Everything in Pro</li><li>✓ SSO & SAML</li><li>✓ Dedicated manager</li><li>✓ SLA guarantee</li>
        </ul>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 'testimonials',
    name: 'Testimonials — Card Grid',
    icon: BookOpen,
    html: `<section style="background:var(--muted)">
  <div class="container">
    <h2 style="text-align:center;margin-bottom:48px">Loved by Thousands</h2>
    <div class="grid grid-3">
      <div style="background:#fff;padding:32px;border-radius:var(--radius);border:1px solid var(--border)">
        <div style="color:#fbbf24;font-size:18px;margin-bottom:16px">★★★★★</div>
        <p style="font-size:15px">"This product transformed our workflow. We saved 20 hours per week."</p>
        <div style="display:flex;align-items:center;gap:12px;margin-top:20px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--accent)"></div>
          <div><strong style="font-size:14px">Jane Doe</strong><br><small class="muted">CEO, TechCo</small></div>
        </div>
      </div>
      <!-- Repeat for 2 more -->
    </div>
  </div>
</section>`
  },
  {
    id: 'cta-banner',
    name: 'CTA — Full Width Banner',
    icon: Zap,
    html: `<section id="cta" style="background:var(--primary);color:#fff;text-align:center;padding:100px 0">
  <div class="container">
    <h2>Ready to Transform Your Business?</h2>
    <p style="opacity:.7;font-size:18px;margin:16px 0 40px">Start your free trial today. No credit card required.</p>
    <a class="btn" href="#" style="background:#fff;color:var(--primary)">Start Free →</a>
  </div>
</section>`
  },
  {
    id: 'stats-bar',
    name: 'Stats — Metric Bar',
    icon: Shield,
    html: `<section style="padding:60px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="grid grid-4" style="text-align:center">
      <div><div style="font-size:40px;font-weight:800;color:var(--accent)">10K+</div><small class="muted">Active Users</small></div>
      <div><div style="font-size:40px;font-weight:800;color:var(--accent)">99.9%</div><small class="muted">Uptime</small></div>
      <div><div style="font-size:40px;font-weight:800;color:var(--accent)">4.9★</div><small class="muted">Avg Rating</small></div>
      <div><div style="font-size:40px;font-weight:800;color:var(--accent)">24/7</div><small class="muted">Support</small></div>
    </div>
  </div>
</section>`
  },
  {
    id: 'faq',
    name: 'FAQ — Accordion',
    icon: BookOpen,
    html: `<section style="padding:80px 0">
  <div class="container" style="max-width:720px">
    <h2 style="text-align:center;margin-bottom:48px">Frequently Asked Questions</h2>
    <div style="display:flex;flex-direction:column;gap:16px">
      <details style="padding:20px;border:1px solid var(--border);border-radius:var(--radius)">
        <summary style="font-weight:700;cursor:pointer">How does the free trial work?</summary>
        <p class="muted" style="margin-top:12px">14 days, full access, no credit card required.</p>
      </details>
      <details style="padding:20px;border:1px solid var(--border);border-radius:var(--radius)">
        <summary style="font-weight:700;cursor:pointer">Can I cancel anytime?</summary>
        <p class="muted" style="margin-top:12px">Yes, cancel with one click. No questions asked.</p>
      </details>
      <details style="padding:20px;border:1px solid var(--border);border-radius:var(--radius)">
        <summary style="font-weight:700;cursor:pointer">Do you offer refunds?</summary>
        <p class="muted" style="margin-top:12px">30-day money-back guarantee on all paid plans.</p>
      </details>
    </div>
  </div>
</section>`
  }
];

// ── Website Archetypes ────────────────────────────────────────
const ARCHETYPES = [
  {
    name: 'Local Service Landing',
    niche: 'plumber, electrician, roofer, HVAC, landscaper',
    sections: ['hero-centered', 'stats-bar', 'features-grid', 'testimonials', 'cta-banner'],
    notes: 'Lead-gen focused. Phone CTA prominent. Trust badges. City/service in H1 for SEO.'
  },
  {
    name: 'SaaS Product Page',
    niche: 'software, app, tool, platform',
    sections: ['hero-split', 'features-grid', 'stats-bar', 'pricing-3col', 'testimonials', 'faq', 'cta-banner'],
    notes: 'Product screenshots. Free trial CTA. Feature/benefit mapping. Social proof.'
  },
  {
    name: 'Portfolio / Agency',
    niche: 'designer, developer, consultant, agency',
    sections: ['hero-centered', 'features-grid', 'testimonials', 'cta-banner'],
    notes: 'Visual-first. Project gallery. Minimal copy. Contact form CTA.'
  },
  {
    name: 'E-commerce Storefront',
    niche: 'product, shop, store, retail',
    sections: ['hero-split', 'features-grid', 'stats-bar', 'testimonials', 'cta-banner'],
    notes: 'Product grid. Add-to-cart. Trust signals. Free shipping banner.'
  },
  {
    name: 'Event / Webinar',
    niche: 'conference, workshop, webinar, summit',
    sections: ['hero-centered', 'stats-bar', 'features-grid', 'cta-banner'],
    notes: 'Date/time prominent. Speaker bios. Countdown. Registration CTA.'
  }
];

// ── Best Practices ───────────────────────────────────────────
const BEST_PRACTICES = [
  'Self-contained HTML: all CSS inline or in <style>. No external stylesheets.',
  'Use system fonts or Google Fonts via <link> in <head>.',
  'Responsive: use clamp() for font sizes, CSS grid, and media queries.',
  'Images: use Unsplash URLs (images.unsplash.com) with ?w= params.',
  'Accessibility: alt text on images, semantic HTML, sufficient contrast.',
  'SEO: include meta description, title, and semantic H1/H2 hierarchy.',
  'Performance: no JS frameworks, no external scripts, minimal DOM.',
  'Brand tokens: always include a brand_tokens JSON string with colors + fonts.',
  'Name format: "Niche — City" for local, "Product Name — Tagline" for SaaS.',
  'Kind: use web_pack for single pages, landing_page for lead-gen, full_site for multi-section.'
];

// ── Copy helpers ─────────────────────────────────────────────
function CopyBlock({ content, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="text-xs font-mono bg-[#0a0a0a] text-gray-300 rounded-md p-4 overflow-x-auto whitespace-pre-wrap break-all max-h-96 overflow-y-auto">
        {content}
      </pre>
    </div>
  );
}

export default function WebsiteLibrary() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'api', label: 'API Schema', icon: Code2 },
    { id: 'scaffold', label: 'HTML Scaffold', icon: Layout },
    { id: 'sections', label: 'Section Library', icon: Layers },
    { id: 'archetypes', label: 'Archetypes', icon: Globe },
    { id: 'brand', label: 'Brand Tokens', icon: Palette },
    { id: 'practices', label: 'Best Practices', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0a0a0a] text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Website Creation Library</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            A complete reference for GPT (or any AI tool) to generate websites that submit directly
            to ApexForge via the ingestPack endpoint. Each submission lands as a pending Pack for
            admin review — nothing goes live until approved.
          </p>
          <div className="grid grid-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg border bg-muted/50">
              <Code2 className="h-5 w-5 mb-2 text-primary" />
              <h4 className="font-semibold text-sm mb-1">API Schema</h4>
              <p className="text-xs text-muted-foreground">Full request body spec with all fields and types.</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <Layout className="h-5 w-5 mb-2 text-primary" />
              <h4 className="font-semibold text-sm mb-1">HTML Scaffold</h4>
              <p className="text-xs text-muted-foreground">Copy-paste starter template with responsive CSS.</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <Layers className="h-5 w-5 mb-2 text-primary" />
              <h4 className="font-semibold text-sm mb-1">Section Library</h4>
              <p className="text-xs text-muted-foreground">8 pre-built sections: hero, features, pricing, testimonials, CTA, stats, FAQ.</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <Globe className="h-5 w-5 mb-2 text-primary" />
              <h4 className="font-semibold text-sm mb-1">Archetypes</h4>
              <p className="text-xs text-muted-foreground">5 website types with recommended section combos per niche.</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <Palette className="h-5 w-5 mb-2 text-primary" />
              <h4 className="font-semibold text-sm mb-1">Brand Tokens</h4>
              <p className="text-xs text-muted-foreground">JSON schema for colors, fonts, radius, shadows.</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <Shield className="h-5 w-5 mb-2 text-primary" />
              <h4 className="font-semibold text-sm mb-1">Best Practices</h4>
              <p className="text-xs text-muted-foreground">10 rules for production-ready, self-contained HTML.</p>
            </div>
          </div>
        </Card>
      )}

      {/* API Schema */}
      {activeTab === 'api' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">API Schema — POST {ENDPOINT_URL}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Send a JSON POST with <code className="bg-muted px-1 rounded">sync_token</code> in the body.
            All HTML must be self-contained (inline CSS, no external scripts).
          </p>
          <CopyBlock content={API_SCHEMA} label="Request body (JSON)" />
          <div className="rounded-md bg-muted px-3 py-2 flex items-center justify-between gap-2">
            <code className="text-xs font-mono break-all">{ENDPOINT_URL}</code>
            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(ENDPOINT_URL)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      )}

      {/* HTML Scaffold */}
      {activeTab === 'scaffold' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">HTML Scaffold — Full Page Template</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete, responsive, self-contained HTML. Includes nav, hero, features, pricing, CTA, and footer.
            Copy and fill in your content.
          </p>
          <CopyBlock content={HTML_SCAFFOLD} label="Full HTML scaffold" />
        </Card>
      )}

      {/* Section Library */}
      {activeTab === 'sections' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Section Library — {SECTIONS.length} Components</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Pre-built, copy-paste HTML sections. Each is self-contained and uses CSS variables from the scaffold.
            Combine them to build any page.
          </p>
          <div className="space-y-4">
            {SECTIONS.map((section) => (
              <div key={section.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <section.icon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{section.name}</span>
                  <code className="text-xs text-muted-foreground ml-auto">#{section.id}</code>
                </div>
                <CopyBlock content={section.html} label={`Section: ${section.name}`} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Archetypes */}
      {activeTab === 'archetypes' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Website Archetypes — {ARCHETYPES.length} Types</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Recommended section combinations per website type. Pick an archetype, then assemble the listed sections.
          </p>
          <div className="space-y-3">
            {ARCHETYPES.map((arch) => (
              <div key={arch.name} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">{arch.name}</h4>
                <p className="text-xs text-muted-foreground">
                  <strong>Niches:</strong> {arch.niche}
                </p>
                <div className="flex flex-wrap gap-2">
                  {arch.sections.map((s) => (
                    <span key={s} className="text-xs px-2 py-1 rounded bg-muted font-mono">#{s}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground pt-1">{arch.notes}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Brand Tokens */}
      {activeTab === 'brand' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Brand Tokens — JSON Schema</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Pass as a JSON string in the <code className="bg-muted px-1 rounded">brand_tokens</code> field.
            These define the visual identity for the generated site.
          </p>
          <CopyBlock content={BRAND_TOKENS} label="brand_tokens (JSON string)" />
        </Card>
      )}

      {/* Best Practices */}
      {activeTab === 'practices' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Best Practices — {BEST_PRACTICES.length} Rules</h3>
          </div>
          <div className="space-y-2">
            {BEST_PRACTICES.map((rule, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm">{rule}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}