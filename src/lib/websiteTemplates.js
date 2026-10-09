// Website template data + assembly logic for the GPT Sync library.
// Shared between WebsiteLibrary (picker) and FrontendPreview (renderer).

export const ENDPOINT_URL = 'https://build-scale-dominate.base44.app/functions/ingestPack';

export const API_SCHEMA = `{
  "sync_token": "<PACK_SYNC_TOKEN>",
  "name": "Plumber Landing — Austin TX",
  "kind": "web_pack",
  "preview_html": "<!doctype html>…",
  "brand_tokens": "{ \\"colors\\": {…}, \\"fonts\\": {…} }",
  "source": "gpt_sync",
  "submitted_by_label": "GPT",
  "metadata": "{ \\"niche\\": \\"plumbing\\", \\"city\\": \\"Austin\\" }"
}`;

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
  }
};

export const ARCHETYPES = [
  {
    id: 'local-service',
    name: 'Local Service Landing',
    niche: 'plumber, electrician, roofer, HVAC, landscaper',
    sections: ['hero-centered', 'stats-bar', 'features-grid', 'testimonials', 'cta-banner'],
    notes: 'Lead-gen focused. Phone CTA prominent. Trust badges. City/service in H1 for SEO.'
  },
  {
    id: 'saas-product',
    name: 'SaaS Product Page',
    niche: 'software, app, tool, platform',
    sections: ['hero-split', 'features-grid', 'stats-bar', 'pricing-3col', 'testimonials', 'faq', 'cta-banner'],
    notes: 'Product screenshots. Free trial CTA. Feature/benefit mapping. Social proof.'
  },
  {
    id: 'portfolio-agency',
    name: 'Portfolio / Agency',
    niche: 'designer, developer, consultant, agency',
    sections: ['hero-centered', 'features-grid', 'testimonials', 'cta-banner'],
    notes: 'Visual-first. Project gallery. Minimal copy. Contact form CTA.'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Storefront',
    niche: 'product, shop, store, retail',
    sections: ['hero-split', 'features-grid', 'stats-bar', 'testimonials', 'cta-banner'],
    notes: 'Product grid. Add-to-cart. Trust signals. Free shipping banner.'
  },
  {
    id: 'event-webinar',
    name: 'Event / Webinar',
    niche: 'conference, workshop, webinar, summit',
    sections: ['hero-centered', 'stats-bar', 'features-grid', 'cta-banner'],
    notes: 'Date/time prominent. Speaker bios. Countdown. Registration CTA.'
  }
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
  'Kind: use web_pack for single pages, landing_page for lead-gen, full_site for multi-section.'
];

// Assemble a full self-contained HTML page from an archetype's section list.
export function assembleTemplate(archetype) {
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
  return `${HTML_HEAD}\n${nav}\n\n${body}\n\n${footer}${HTML_FOOT}`;
}