// Deterministic Asset Classifier — categorizes uploaded assets based on file name,
// extension, and content patterns without relying on AI. Every asset gets a
// deterministic category, subcategory, and source type.

export interface ClassificationResult {
  category: string;
  subcategory: string;
  source_type: string;
  tags: string[];
  detected_systems: string[];
}

interface ClassRule {
  pattern: RegExp;
  category: string;
  subcategory: string;
  source_type: string;
  tags: string[];
}

// Name-based rules — checked in order, first match wins
const NAME_RULES: ClassRule[] = [
  { pattern: /agent|swarm|autonomous/i, category: "Agent Systems", subcategory: "Autonomous Agents", source_type: "agent_pack", tags: ["ai", "autonomy", "agents"] },
  { pattern: /browser|playwright|cloud-browser|headless|scraper|scrape/i, category: "Browser & Scraping", subcategory: "Browser Automation", source_type: "code", tags: ["browser", "automation", "scraping"] },
  { pattern: /social|tiktok|instagram|facebook|twitter|linkedin|youtube/i, category: "Social Media Systems", subcategory: "Social Automation", source_type: "code", tags: ["social", "automation"] },
  { pattern: /seo|god.?mode|programmatic|serp|backlink|citation/i, category: "SEO Systems", subcategory: "Search Optimization", source_type: "code", tags: ["seo", "search"] },
  { pattern: /template|pack|mockup|blueprint|genome/i, category: "Template Packs", subcategory: "Design Templates", source_type: "template", tags: ["template", "design"] },
  { pattern: /workflow|automation|pipeline|cron|schedule/i, category: "Workflow Systems", subcategory: "Process Automation", source_type: "code", tags: ["workflow", "automation"] },
  { pattern: /dashboard|admin|portal|management/i, category: "Admin Interfaces", subcategory: "Management UI", source_type: "code", tags: ["ui", "admin"] },
  { pattern: /forensic|audit|security|vulnerability|scan/i, category: "Security & Audit", subcategory: "Forensic Audit", source_type: "code", tags: ["security", "audit"] },
  { pattern: /captcha|solver|recaptcha|hcaptcha/i, category: "Browser & Scraping", subcategory: "Captcha Solving", source_type: "code", tags: ["captcha", "automation"] },
  { pattern: /provision|deploy|vercel|railway|supabase|godaddy|domain/i, category: "Infrastructure & Deployment", subcategory: "Provisioning", source_type: "code", tags: ["infra", "deployment"] },
  { pattern: /crm|lead|outreach|contact|follow.?up/i, category: "Business & Revenue", subcategory: "CRM & Outreach", source_type: "code", tags: ["crm", "sales"] },
  { pattern: /analytics|tracking|ga4|gtag|heatmap/i, category: "Analytics & Testing", subcategory: "Performance Tracking", source_type: "code", tags: ["analytics"] },
  { pattern: /stripe|payment|billing|subscription|checkout/i, category: "Business & Revenue", subcategory: "Payment Systems", source_type: "code", tags: ["payments", "billing"] },
  { pattern: /media|image|video|speech|generate/i, category: "Content & Media", subcategory: "Media Generation", source_type: "media", tags: ["media", "ai"] },
  { pattern: /research|intelligence|benchmark|competitor/i, category: "Intelligence & Knowledge", subcategory: "Market Research", source_type: "code", tags: ["research", "intelligence"] },
  { pattern: /onboarding|setup|wizard|pipeline/i, category: "Workflow Systems", subcategory: "Onboarding", source_type: "code", tags: ["onboarding"] },
  { pattern: /config|setting|env|secret/i, category: "Configuration", subcategory: "System Config", source_type: "config", tags: ["config"] },
  { pattern: /readme|doc|guide|instruction/i, category: "Documentation", subcategory: "Reference Docs", source_type: "document", tags: ["docs"] },
];

// Extension-based fallback mapping
const EXTENSION_MAP: Record<string, { source_type: string; category: string; subcategory: string }> = {
  zip: { source_type: "upload", category: "Archive", subcategory: "Compressed Archive" },
  pdf: { source_type: "document", category: "Documents", subcategory: "PDF Document" },
  json: { source_type: "config", category: "Configuration", subcategory: "JSON Config" },
  js: { source_type: "code", category: "Code Modules", subcategory: "JavaScript" },
  ts: { source_type: "code", category: "Code Modules", subcategory: "TypeScript" },
  jsx: { source_type: "code", category: "Code Modules", subcategory: "React Component" },
  tsx: { source_type: "code", category: "Code Modules", subcategory: "React + TypeScript" },
  md: { source_type: "document", category: "Documentation", subcategory: "Markdown" },
  txt: { source_type: "document", category: "Documentation", subcategory: "Plain Text" },
  csv: { source_type: "document", category: "Data Files", subcategory: "CSV Data" },
  xlsx: { source_type: "document", category: "Data Files", subcategory: "Excel Spreadsheet" },
  png: { source_type: "media", category: "Media Assets", subcategory: "PNG Image" },
  jpg: { source_type: "media", category: "Media Assets", subcategory: "JPEG Image" },
  jpeg: { source_type: "media", category: "Media Assets", subcategory: "JPEG Image" },
  gif: { source_type: "media", category: "Media Assets", subcategory: "GIF Image" },
  svg: { source_type: "media", category: "Media Assets", subcategory: "SVG Vector" },
  mp4: { source_type: "media", category: "Media Assets", subcategory: "MP4 Video" },
  mp3: { source_type: "media", category: "Media Assets", subcategory: "MP3 Audio" },
  html: { source_type: "code", category: "Code Modules", subcategory: "HTML" },
  css: { source_type: "code", category: "Code Modules", subcategory: "CSS" },
  yml: { source_type: "config", category: "Configuration", subcategory: "YAML Config" },
  yaml: { source_type: "config", category: "Configuration", subcategory: "YAML Config" },
};

// Known system name patterns for detection within file names
const SYSTEM_PATTERNS: Record<string, RegExp> = {
  "Autonomous Agent": /agent|autonomous/i,
  "Cloud Browser": /browser|playwright|headless/i,
  "Social Media Engine": /social|tiktok|instagram/i,
  "SEO Engine": /seo|godmode|programmatic/i,
  "Research Engine": /research|benchmark/i,
  "Provisioning System": /provision|deploy|vercel|railway/i,
  "CRM System": /crm|lead|outreach/i,
  "Media Generator": /media|image|video|generate/i,
  "Forensic Audit": /forensic|audit|security/i,
  "Captcha Solver": /captcha|solver/i,
  "Workflow Engine": /workflow|automation|pipeline/i,
  "Analytics System": /analytics|tracking|ga4/i,
  "Payment System": /stripe|payment|billing/i,
  "Onboarding Pipeline": /onboarding|wizard/i,
};

export function classifyAsset(fileName: string, fileExtension?: string): ClassificationResult {
  const name = fileName.toLowerCase();
  const ext = (fileExtension || fileName.split('.').pop() || '').toLowerCase();

  // Try name-based rules first
  for (const rule of NAME_RULES) {
    if (rule.pattern.test(name)) {
      const detectedSystems: string[] = [];
      for (const [system, pattern] of Object.entries(SYSTEM_PATTERNS)) {
        if (pattern.test(name)) detectedSystems.push(system);
      }
      return {
        category: rule.category,
        subcategory: rule.subcategory,
        source_type: rule.source_type,
        tags: rule.tags,
        detected_systems: detectedSystems,
      };
    }
  }

  // Fall back to extension-based mapping
  const extMap = EXTENSION_MAP[ext];
  if (extMap) {
    return {
      category: extMap.category,
      subcategory: extMap.subcategory,
      source_type: extMap.source_type,
      tags: [ext],
      detected_systems: [],
    };
  }

  // Default fallback
  return {
    category: "Uncategorized",
    subcategory: "General",
    source_type: "other",
    tags: [],
    detected_systems: [],
  };
}

// Get all known categories (for UI dropdowns and stats)
export function getAllCategories(): string[] {
  const categories = new Set<string>();
  for (const rule of NAME_RULES) categories.add(rule.category);
  for (const ext of Object.values(EXTENSION_MAP)) categories.add(ext.category);
  categories.add("Uncategorized");
  return Array.from(categories).sort();
}