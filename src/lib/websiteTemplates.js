// Website template data + assembly logic for the GPT Sync library.
// Shared between WebsiteLibrary (picker) and FrontendPreview (renderer).

export const ENDPOINT_URL = 'https://build-scale-dominate.base44.app/functions/ingestPack';

export const API_SCHEMA = `{
  "sync_token": "<PACK_SYNC_TOKEN>",
  "name": "Plumber Landing — Austin TX",
  "kind": "web_pack",
  "category": "local_service",
  "preview_html": "<!doctype html>…",
  "brand_tokens": "{ \\"colors\\": {…}, \\"fonts\\": {…} }",
  "source": "gpt_sync",
  "submitted_by_label": "GPT",
  "metadata": "{ \\"niche\\": \\"plumbing\\", \\"city\\": \\"Austin\\" }"
}`;

// ── Comprehensive Frontend Category Library ──────────────────────
export const CATEGORIES = [
  { id: 'pwa', label: 'PWA — Progressive Web App', icon: '📱' },
  { id: 'landing_page', label: 'Landing Page', icon: '📄' },
  { id: 'saas', label: 'SaaS Product', icon: '⚡' },
  { id: 'ecommerce', label: 'E-commerce Storefront', icon: '🛒' },
  { id: 'portfolio', label: 'Portfolio / Agency', icon: '🎨' },
  { id: 'blog', label: 'Blog / Magazine', icon: '✍️' },
  { id: 'dashboard', label: 'Dashboard / Admin Panel', icon: '📊' },
  { id: 'marketing', label: 'Marketing Site', icon: '📣' },
  { id: 'documentation', label: 'Documentation / Docs', icon: '📚' },
  { id: 'community', label: 'Community / Forum', icon: '💬' },
  { id: 'event', label: 'Event / Webinar', icon: '📅' },
  { id: 'local_service', label: 'Local Service', icon: '🔧' },
  { id: 'restaurant', label: 'Restaurant / Food', icon: '🍽️' },
  { id: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { id: 'education', label: 'Education / LMS', icon: '🎓' },
  { id: 'healthcare', label: 'Healthcare / Medical', icon: '⚕️' },
  { id: 'finance', label: 'Finance / Fintech', icon: '💰' },
  { id: 'ai_interface', label: 'AI / ML Interface', icon: '🤖' },
  { id: 'social', label: 'Social / Community', icon: '👥' },
  { id: 'media', label: 'Media / Gallery', icon: '🖼️' },
  { id: 'booking', label: 'Booking / Reservation', icon: '📆' },
  { id: 'nonprofit', label: 'Nonprofit / Charity', icon: '❤️' },
  { id: 'legal', label: 'Legal / Professional', icon: '⚖️' },
  { id: 'directory', label: 'Directory / Listing', icon: '📋' },
  { id: 'mobile_app', label: 'Mobile App Shell', icon: '📲' },
  { id: 'game', label: 'Game / Interactive', icon: '🎮' },
  { id: 'crypto', label: 'Crypto / Web3', icon: '🔗' },
  { id: 'newsletter', label: 'Newsletter / Publication', icon: '📧' },
  { id: 'podcast', label: 'Podcast / Audio', icon: '🎙️' },
  { id: 'video', label: 'Video / Streaming', icon: '🎬' },
  { id: 'other', label: 'Other', icon: '📦' },
];

export const BRAND_TOKENS = `{
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

export const HTML_HEAD = `<!doctype html>
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
<body>`;

// PWA-specific head with manifest meta tags, theme-color, and install hints
export const PWA_HEAD = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="description" content="PAGE DESCRIPTION HERE" />
  <meta name="theme-color" content="#0a0a0a" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="App Name" />
  <title>App Name — PWA</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --primary:#0a0a0a;--accent:#3b82f6;--bg:#fff;--muted:#f5f5f5;
      --text:#0a0a0a;--border:#e5e7eb;--radius:8px;--max:1200px;
      --safe-top:env(safe-area-inset-top,0px);--safe-bottom:env(safe-area-inset-bottom,0px);
    }
    body{font-family:Inter,system-ui,sans-serif;color:var(--text);background:var(--bg);line-height:1.6;
      padding-top:var(--safe-top);padding-bottom:var(--safe-bottom)}
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
    .install-banner{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--primary);color:#fff;
      padding:16px 24px;z-index:999;align-items:center;justify-content:space-between;gap:12px}
    .install-banner.show{display:flex}
  </style>
</head>
<body>`;

export const HTML_FOOT = `
</body>
</html>`;

export const SECTIONS = {
  'hero-centered': {
    name: 'Hero — Centered',
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
  'hero-split': {
    name: 'Hero — Split (Image Right)',
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
  'features-grid': {
    name: 'Features — 3 Column Grid',
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
  'pricing-3col': {
    name: 'Pricing — 3 Tier',
    html: `<section id="pricing">
  <div class="container">
    <h2 style="text-align:center;margin-bottom:48px">Pricing That Scales With You</h2>
    <div class="grid grid-3">
      <div style="padding:32px;border-radius:var(--radius);border:1px solid var(--border)">
        <h3>Starter</h3><p class="muted" style="font-size:14px">For individuals</p>
        <div style="font-size:48px;font-weight:800;margin:20px 0">$0<span style="font-size:16px;font-weight:400" class="muted">/mo</span></div>
        <a class="btn btn-outline" href="#" style="width:100%;justify-content:center">Get Started</a>
        <ul style="list-style:none;margin-top:24px;display:flex;flex-direction:column;gap:12px"><li>✓ 1 project</li><li>✓ Basic analytics</li><li>✓ Email support</li></ul>
      </div>
      <div style="padding:32px;border-radius:var(--radius);border:2px solid var(--primary);position:relative">
        <span style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;padding:4px 16px;border-radius:99px;font-size:12px;font-weight:700">POPULAR</span>
        <h3>Pro</h3><p class="muted" style="font-size:14px">For growing teams</p>
        <div style="font-size:48px;font-weight:800;margin:20px 0">$29<span style="font-size:16px;font-weight:400" class="muted">/mo</span></div>
        <a class="btn btn-primary" href="#" style="width:100%;justify-content:center">Start Free Trial</a>
        <ul style="list-style:none;margin-top:24px;display:flex;flex-direction:column;gap:12px"><li>✓ Unlimited projects</li><li>✓ Advanced analytics</li><li>✓ Priority support</li><li>✓ Custom branding</li></ul>
      </div>
      <div style="padding:32px;border-radius:var(--radius);border:1px solid var(--border)">
        <h3>Enterprise</h3><p class="muted" style="font-size:14px">For large orgs</p>
        <div style="font-size:48px;font-weight:800;margin:20px 0">Custom</div>
        <a class="btn btn-outline" href="#" style="width:100%;justify-content:center">Contact Sales</a>
        <ul style="list-style:none;margin-top:24px;display:flex;flex-direction:column;gap:12px"><li>✓ Everything in Pro</li><li>✓ SSO & SAML</li><li>✓ Dedicated manager</li><li>✓ SLA guarantee</li></ul>
      </div>
    </div>
  </div>
</section>`
  },
  'testimonials': {
    name: 'Testimonials — Card Grid',
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
      <div style="background:#fff;padding:32px;border-radius:var(--radius);border:1px solid var(--border)">
        <div style="color:#fbbf24;font-size:18px;margin-bottom:16px">★★★★★</div>
        <p style="font-size:15px">"Best decision we made this year. ROI in the first month."</p>
        <div style="display:flex;align-items:center;gap:12px;margin-top:20px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--accent)"></div>
          <div><strong style="font-size:14px">John Smith</strong><br><small class="muted">CTO, DataInc</small></div>
        </div>
      </div>
      <div style="background:#fff;padding:32px;border-radius:var(--radius);border:1px solid var(--border)">
        <div style="color:#fbbf24;font-size:18px;margin-bottom:16px">★★★★★</div>
        <p style="font-size:15px">"The support team is incredible. They helped us migrate in a day."</p>
        <div style="display:flex;align-items:center;gap:12px;margin-top:20px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--accent)"></div>
          <div><strong style="font-size:14px">Sarah Lee</strong><br><small class="muted">Founder, StartupX</small></div>
        </div>
      </div>
    </div>
  </div>
</section>`
  },
  'cta-banner': {
    name: 'CTA — Full Width Banner',
    html: `<section id="cta" style="background:var(--primary);color:#fff;text-align:center;padding:100px 0">
  <div class="container">
    <h2>Ready to Transform Your Business?</h2>
    <p style="opacity:.7;font-size:18px;margin:16px 0 40px">Start your free trial today. No credit card required.</p>
    <a class="btn" href="#" style="background:#fff;color:var(--primary)">Start Free →</a>
  </div>
</section>`
  },
  'stats-bar': {
    name: 'Stats — Metric Bar',
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
  'faq': {
    name: 'FAQ — Accordion',
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
  },
  'pwa-install': {
    name: 'PWA — Install Banner',
    html: `<div id="installBanner" class="install-banner show">
  <div style="display:flex;align-items:center;gap:12px">
    <span style="font-size:24px">📱</span>
    <div>
      <strong style="font-size:14px">Install App</strong>
      <p style="font-size:12px;opacity:.7">Add to your home screen for a native experience</p>
    </div>
  </div>
  <button onclick="document.getElementById('installBanner').classList.remove('show')" style="background:#fff;color:var(--primary);border:0;border-radius:var(--radius);padding:8px 20px;font-weight:700;cursor:pointer">Install</button>
</div>`
  },
  'app-shell-nav': {
    name: 'App Shell — Bottom Tab Nav',
    html: `<nav style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid var(--border);display:flex;justify-content:space-around;padding:8px 0;z-index:100">
  <a href="#" style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 16px;color:var(--primary)">
    <span style="font-size:20px">🏠</span><span style="font-size:10px;font-weight:600">Home</span>
  </a>
  <a href="#" style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 16px;color:#737373">
    <span style="font-size:20px">🔍</span><span style="font-size:10px;font-weight:600">Search</span>
  </a>
  <a href="#" style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 16px;color:#737373">
    <span style="font-size:20px">❤️</span><span style="font-size:10px;font-weight:600">Saved</span>
  </a>
  <a href="#" style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 16px;color:#737373">
    <span style="font-size:20px">👤</span><span style="font-size:10px;font-weight:600">Profile</span>
  </a>
</nav>`
  },
  'content-list': {
    name: 'Content List — Card Feed',
    html: `<section style="padding:40px 0">
  <div class="container" style="max-width:640px">
    <h2 style="margin-bottom:24px">Latest Updates</h2>
    <div style="display:flex;flex-direction:column;gap:16px">
      <article style="display:flex;gap:16px;padding:16px;border:1px solid var(--border);border-radius:var(--radius)">
        <div style="width:80px;height:80px;border-radius:var(--radius);background:var(--muted);flex-shrink:0"></div>
        <div>
          <h3 style="font-size:16px">Article Title Here</h3>
          <p class="muted" style="font-size:13px;margin-top:4px">Short excerpt describing the content of this item in one or two lines.</p>
          <small class="muted" style="font-size:11px">5 min read · Oct 2026</small>
        </div>
      </article>
      <article style="display:flex;gap:16px;padding:16px;border:1px solid var(--border);border-radius:var(--radius)">
        <div style="width:80px;height:80px;border-radius:var(--radius);background:var(--muted);flex-shrink:0"></div>
        <div>
          <h3 style="font-size:16px">Another Article Title</h3>
          <p class="muted" style="font-size:13px;margin-top:4px">Short excerpt describing the content of this item in one or two lines.</p>
          <small class="muted" style="font-size:11px">3 min read · Oct 2026</small>
        </div>
      </article>
    </div>
  </div>
</section>`
  },
  'dashboard-cards': {
    name: 'Dashboard — Stat Cards',
    html: `<section style="padding:40px 0;background:var(--muted)">
  <div class="container">
    <h2 style="margin-bottom:24px">Overview</h2>
    <div class="grid grid-4">
      <div style="background:#fff;padding:24px;border-radius:var(--radius);border:1px solid var(--border)">
        <p class="muted" style="font-size:12px;font-weight:600;text-transform:uppercase">Revenue</p>
        <p style="font-size:28px;font-weight:800;margin-top:8px">$48.2K</p>
        <p style="font-size:12px;color:#22c55e;margin-top:4px">↑ 12% vs last month</p>
      </div>
      <div style="background:#fff;padding:24px;border-radius:var(--radius);border:1px solid var(--border)">
        <p class="muted" style="font-size:12px;font-weight:600;text-transform:uppercase">Users</p>
        <p style="font-size:28px;font-weight:800;margin-top:8px">2,847</p>
        <p style="font-size:12px;color:#22c55e;margin-top:4px">↑ 8% vs last month</p>
      </div>
      <div style="background:#fff;padding:24px;border-radius:var(--radius);border:1px solid var(--border)">
        <p class="muted" style="font-size:12px;font-weight:600;text-transform:uppercase">Orders</p>
        <p style="font-size:28px;font-weight:800;margin-top:8px">1,204</p>
        <p style="font-size:12px;color:#ef4444;margin-top:4px">↓ 3% vs last month</p>
      </div>
      <div style="background:#fff;padding:24px;border-radius:var(--radius);border:1px solid var(--border)">
        <p class="muted" style="font-size:12px;font-weight:600;text-transform:uppercase">Conversion</p>
        <p style="font-size:28px;font-weight:800;margin-top:8px">4.2%</p>
        <p style="font-size:12px;color:#22c55e;margin-top:4px">↑ 0.5% vs last month</p>
      </div>
    </div>
  </div>
</section>`
  },
  'product-grid': {
    name: 'Product Grid — E-commerce',
    html: `<section style="padding:40px 0">
  <div class="container">
    <h2 style="margin-bottom:24px">Featured Products</h2>
    <div class="grid grid-4">
      <div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
        <div style="aspect-ratio:1;background:var(--muted)"></div>
        <div style="padding:12px">
          <p style="font-size:14px;font-weight:600">Product Name</p>
          <p style="font-size:16px;font-weight:800;margin-top:4px">$49.99</p>
          <button style="width:100%;margin-top:8px;padding:8px;background:var(--primary);color:#fff;border:0;border-radius:var(--radius);font-weight:600;cursor:pointer">Add to Cart</button>
        </div>
      </div>
      <div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
        <div style="aspect-ratio:1;background:var(--muted)"></div>
        <div style="padding:12px">
          <p style="font-size:14px;font-weight:600">Product Name</p>
          <p style="font-size:16px;font-weight:800;margin-top:4px">$29.99</p>
          <button style="width:100%;margin-top:8px;padding:8px;background:var(--primary);color:#fff;border:0;border-radius:var(--radius);font-weight:600;cursor:pointer">Add to Cart</button>
        </div>
      </div>
      <div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
        <div style="aspect-ratio:1;background:var(--muted)"></div>
        <div style="padding:12px">
          <p style="font-size:14px;font-weight:600">Product Name</p>
          <p style="font-size:16px;font-weight:800;margin-top:4px">$79.99</p>
          <button style="width:100%;margin-top:8px;padding:8px;background:var(--primary);color:#fff;border:0;border-radius:var(--radius);font-weight:600;cursor:pointer">Add to Cart</button>
        </div>
      </div>
      <div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
        <div style="aspect-ratio:1;background:var(--muted)"></div>
        <div style="padding:12px">
          <p style="font-size:14px;font-weight:600">Product Name</p>
          <p style="font-size:16px;font-weight:800;margin-top:4px">$19.99</p>
          <button style="width:100%;margin-top:8px;padding:8px;background:var(--primary);color:#fff;border:0;border-radius:var(--radius);font-weight:600;cursor:pointer">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</section>`
  },
};

export const ARCHETYPES = [
  {
    id: 'pwa-app',
    name: 'PWA — Progressive Web App',
    category: 'pwa',
    isPwa: true,
    niche: 'installable web app, offline-first, mobile-first, app shell',
    sections: ['hero-centered', 'features-grid', 'pwa-install', 'app-shell-nav'],
    notes: 'Installable, offline-capable. Includes theme-color, apple-mobile-web-app meta, safe-area insets, install banner, and bottom tab navigation. Add a manifest.json and service worker for full PWA compliance.'
  },
  {
    id: 'pwa-ecommerce',
    name: 'PWA — E-commerce App',
    category: 'pwa',
    isPwa: true,
    niche: 'shop, store, mobile commerce, installable storefront',
    sections: ['hero-split', 'product-grid', 'features-grid', 'pwa-install', 'app-shell-nav'],
    notes: 'Installable shopping app with product grid, bottom tab nav, and install prompt. Offline product browsing with cached catalog.'
  },
  {
    id: 'pwa-social',
    name: 'PWA — Social Feed App',
    category: 'pwa',
    isPwa: true,
    niche: 'social network, community feed, messaging, mobile app',
    sections: ['content-list', 'app-shell-nav', 'pwa-install'],
    notes: 'Mobile-first social feed with bottom tab navigation and install banner. Content list as main feed, profile tab, notifications.'
  },
  {
    id: 'local-service',
    name: 'Local Service Landing',
    category: 'local_service',
    niche: 'plumber, electrician, roofer, HVAC, landscaper',
    sections: ['hero-centered', 'stats-bar', 'features-grid', 'testimonials', 'cta-banner'],
    notes: 'Lead-gen focused. Phone CTA prominent. Trust badges. City/service in H1 for SEO.'
  },
  {
    id: 'saas-product',
    name: 'SaaS Product Page',
    category: 'saas',
    niche: 'software, app, tool, platform',
    sections: ['hero-split', 'features-grid', 'stats-bar', 'pricing-3col', 'testimonials', 'faq', 'cta-banner'],
    notes: 'Product screenshots. Free trial CTA. Feature/benefit mapping. Social proof.'
  },
  {
    id: 'portfolio-agency',
    name: 'Portfolio / Agency',
    category: 'portfolio',
    niche: 'designer, developer, consultant, agency',
    sections: ['hero-centered', 'features-grid', 'testimonials', 'cta-banner'],
    notes: 'Visual-first. Project gallery. Minimal copy. Contact form CTA.'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Storefront',
    category: 'ecommerce',
    niche: 'product, shop, store, retail',
    sections: ['hero-split', 'product-grid', 'features-grid', 'stats-bar', 'testimonials', 'cta-banner'],
    notes: 'Product grid. Add-to-cart. Trust signals. Free shipping banner.'
  },
  {
    id: 'event-webinar',
    name: 'Event / Webinar',
    category: 'event',
    niche: 'conference, workshop, webinar, summit',
    sections: ['hero-centered', 'stats-bar', 'features-grid', 'cta-banner'],
    notes: 'Date/time prominent. Speaker bios. Countdown. Registration CTA.'
  },
  {
    id: 'dashboard-admin',
    name: 'Dashboard / Admin Panel',
    category: 'dashboard',
    niche: 'analytics, admin, CRM, internal tool, control panel',
    sections: ['dashboard-cards', 'features-grid', 'stats-bar'],
    notes: 'Data-dense layout. Sidebar nav. Stat cards. Charts. Table views. Role-based access.'
  },
  {
    id: 'blog-magazine',
    name: 'Blog / Magazine',
    category: 'blog',
    niche: 'news, articles, publication, editorial',
    sections: ['hero-centered', 'content-list', 'features-grid', 'cta-banner'],
    notes: 'Content-first. Article cards. Categories. Author bylines. Reading time. Newsletter signup.'
  },
  {
    id: 'documentation',
    name: 'Documentation Site',
    category: 'documentation',
    niche: 'docs, API reference, knowledge base, help center',
    sections: ['hero-centered', 'features-grid', 'faq'],
    notes: 'Sidebar nav. Search bar. Code blocks. Version selector. Dark mode toggle.'
  },
  {
    id: 'community-forum',
    name: 'Community / Forum',
    category: 'community',
    niche: 'discussion, Q&A, support forum, social community',
    sections: ['content-list', 'features-grid', 'stats-bar', 'cta-banner'],
    notes: 'Thread list. Topic categories. Reputation badges. Reply threading. Search.'
  },
  {
    id: 'restaurant',
    name: 'Restaurant / Food',
    category: 'restaurant',
    niche: 'restaurant, cafe, bakery, food delivery, menu',
    sections: ['hero-centered', 'features-grid', 'testimonials', 'cta-banner'],
    notes: 'Menu display. Online ordering. Reservations. Location/map. Hours. Photo gallery.'
  },
  {
    id: 'real-estate',
    name: 'Real Estate Listings',
    category: 'real_estate',
    niche: 'property, listings, agent, rental, homes for sale',
    sections: ['hero-split', 'product-grid', 'features-grid', 'testimonials', 'cta-banner'],
    notes: 'Property cards. Search filters. Map view. Price ranges. Agent contact. Photo galleries.'
  },
  {
    id: 'education-lms',
    name: 'Education / LMS',
    category: 'education',
    niche: 'courses, online learning, school, training, academy',
    sections: ['hero-split', 'features-grid', 'pricing-3col', 'testimonials', 'faq', 'cta-banner'],
    notes: 'Course catalog. Progress tracking. Video lessons. Quizzes. Certificates. Instructor profiles.'
  },
  {
    id: 'healthcare',
    name: 'Healthcare / Telemedicine',
    category: 'healthcare',
    niche: 'clinic, doctor, telehealth, medical practice, health portal',
    sections: ['hero-centered', 'features-grid', 'testimonials', 'faq', 'cta-banner'],
    notes: 'Appointment booking. Provider profiles. HIPAA notice. Patient portal. Insurance info.'
  },
  {
    id: 'finance-fintech',
    name: 'Finance / Fintech',
    category: 'finance',
    niche: 'banking, payments, investing, budgeting, financial dashboard',
    sections: ['dashboard-cards', 'hero-split', 'features-grid', 'pricing-3col', 'faq', 'cta-banner'],
    notes: 'Account dashboards. Transaction lists. Charts. Security badges. Compliance disclaimers.'
  },
  {
    id: 'ai-interface',
    name: 'AI / ML Interface',
    category: 'ai_interface',
    niche: 'AI chat, ML tool, assistant, chatbot, generative AI',
    sections: ['hero-centered', 'features-grid', 'pricing-3col', 'faq', 'cta-banner'],
    notes: 'Chat interface. Prompt input. Model selector. API docs link. Usage limits. Streaming responses.'
  },
  {
    id: 'booking',
    name: 'Booking / Reservation',
    category: 'booking',
    niche: 'hotel, salon, spa, appointment, scheduling, reservation',
    sections: ['hero-centered', 'features-grid', 'pricing-3col', 'testimonials', 'faq', 'cta-banner'],
    notes: 'Calendar picker. Time slots. Availability grid. Confirmation flow. Reminders.'
  },
  {
    id: 'directory-listing',
    name: 'Directory / Listing',
    category: 'directory',
    niche: 'business directory, classifieds, job board, marketplace listings',
    sections: ['hero-centered', 'content-list', 'features-grid', 'cta-banner'],
    notes: 'Search + filter. Category browse. Listing cards. Map view. Submit listing CTA.'
  },
  {
    id: 'nonprofit',
    name: 'Nonprofit / Charity',
    category: 'nonprofit',
    niche: 'charity, foundation, cause, donation, fundraising',
    sections: ['hero-centered', 'stats-bar', 'features-grid', 'testimonials', 'cta-banner'],
    notes: 'Donation CTA prominent. Impact metrics. Volunteer signup. Events. Transparency report.'
  },
  {
    id: 'legal-professional',
    name: 'Legal / Professional Services',
    category: 'legal',
    niche: 'law firm, attorney, accountant, consultant, professional services',
    sections: ['hero-split', 'features-grid', 'testimonials', 'faq', 'cta-banner'],
    notes: 'Practice areas. Attorney bios. Case results. Consultation booking. Bar credentials.'
  },
  {
    id: 'newsletter',
    name: 'Newsletter / Publication',
    category: 'newsletter',
    niche: 'email newsletter, subscription, digital publication, creator',
    sections: ['hero-centered', 'content-list', 'testimonials', 'cta-banner'],
    notes: 'Email signup prominent. Issue archive. Free vs paid tiers. Author spotlight. RSS feed.'
  },
  {
    id: 'podcast',
    name: 'Podcast / Audio',
    category: 'podcast',
    niche: 'podcast show, audio series, music, sound, radio',
    sections: ['hero-centered', 'content-list', 'features-grid', 'cta-banner'],
    notes: 'Episode player. Subscribe buttons (Apple, Spotify, RSS). Show notes. Guest bios. Transcript.'
  },
  {
    id: 'video-streaming',
    name: 'Video / Streaming',
    category: 'video',
    niche: 'video platform, streaming, course video, media hosting',
    sections: ['hero-split', 'content-list', 'features-grid', 'pricing-3col', 'cta-banner'],
    notes: 'Video player. Thumbnail grid. Categories. Search. Watchlist. Subscription tiers.'
  },
  {
    id: 'crypto-web3',
    name: 'Crypto / Web3',
    category: 'crypto',
    niche: 'blockchain, DeFi, NFT, token, wallet, DAO',
    sections: ['hero-centered', 'stats-bar', 'features-grid', 'faq', 'cta-banner'],
    notes: 'Wallet connect. Token metrics. Smart contract addresses. Audit badges. Gas tracker.'
  },
  {
    id: 'mobile-app-shell',
    name: 'Mobile App Shell',
    category: 'mobile_app',
    isPwa: true,
    niche: 'mobile-first UI, app prototype, native-style interface',
    sections: ['hero-centered', 'app-shell-nav', 'pwa-install'],
    notes: 'Native app-style layout with bottom tab bar, safe-area support, and install prompt. Ideal for prototyping mobile apps as PWAs.'
  },
  {
    id: 'game-interactive',
    name: 'Game / Interactive',
    category: 'game',
    niche: 'browser game, interactive demo, playful landing, quiz',
    sections: ['hero-centered', 'features-grid', 'stats-bar', 'cta-banner'],
    notes: 'Canvas/WebGL area. Score display. Leaderboard. Play button. Social share. Minimal text.'
  },
];

export const BEST_PRACTICES = [
  'Self-contained HTML: all CSS inline or in <style>. No external stylesheets.',
  'Use system fonts or Google Fonts via <link> in <head>.',
  'Responsive: use clamp() for font sizes, CSS grid, and media queries.',
  'Images: use Unsplash URLs (images.unsplash.com) with ?w= params.',
  'Accessibility: alt text on images, semantic HTML, sufficient contrast.',
  'SEO: include meta description, title, and semantic H1/H2 hierarchy.',
  'Performance: no JS frameworks, no external scripts, minimal DOM.',
  'Brand tokens: always include a brand_tokens JSON string with colors + fonts.',
  'Name format: "Niche — City" for local, "Product Name — Tagline" for SaaS.',
  'Kind: use web_pack for single pages, landing_page for lead-gen, full_site for multi-section.',
  'PWA: include theme-color, apple-mobile-web-app-capable, viewport-fit=cover, and safe-area insets.',
  'PWA: add a manifest.json link and register a service worker for offline support when deploying.',
  'Category: always assign a category from the CATEGORIES list when submitting.',
];

// Assemble a full self-contained HTML page from an archetype's section list.
export function assembleTemplate(archetype) {
  const head = archetype.isPwa ? PWA_HEAD : HTML_HEAD;
  const nav = `<nav class="container" style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px">
    <strong>ApexForge</strong>
    <div style="display:flex;gap:32px;align-items:center">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a class="btn btn-primary" href="#cta">Get Started</a>
    </div>
  </nav>`;
  const body = archetype.sections
    .map((id) => SECTIONS[id]?.html || '')
    .join('\n\n');
  const footer = `<footer style="padding:48px 0;border-top:1px solid var(--border)">
    <div class="container" style="display:flex;justify-content:space-between;align-items:center">
      <small class="muted">© 2026 ApexForge. All rights reserved.</small>
      <div style="display:flex;gap:24px"><a href="#">Privacy</a><a href="#">Terms</a></div>
    </div>
  </footer>`;
  return `${head}\n${nav}\n\n${body}\n\n${footer}${HTML_FOOT}`;
}