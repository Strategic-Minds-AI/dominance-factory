// Google Backup Engine — shared logic for backing up generated content to
// Google Drive and campaign progress to Google Sheets.
// Used by both the cronRunner (direct import) and the googleBackup function.

async function getToken(base44: any, type: string): Promise<string> {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection(type);
  return accessToken;
}

async function findOrCreateFolder(token: string, name: string, parentId?: string): Promise<string> {
  const headers = { Authorization: `Bearer ${token}` };
  let q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) q += ` and '${parentId}' in parents`;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&pageSize=1&fields=files(id)`, {
    headers, signal: AbortSignal.timeout(15000),
  });
  if (res.ok) {
    const data = await res.json();
    if (data.files?.length) return data.files[0].id;
  }
  const folderBody: any = { name, mimeType: 'application/vnd.google-apps.folder' };
  if (parentId) folderBody.parents = [parentId];
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(folderBody), signal: AbortSignal.timeout(15000),
  });
  if (!createRes.ok) throw new Error(`Failed to create folder ${name}: ${createRes.status}`);
  const folderData = await createRes.json();
  return folderData.id;
}

async function uploadFileToDrive(token: string, name: string, content: string, contentType: string, parentId: string): Promise<string> {
  const boundary = 'apexforge_' + Date.now();
  const metadata: any = { name, parents: [parentId] };
  const multipart = [
    `--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '', JSON.stringify(metadata),
    `--${boundary}`, `Content-Type: ${contentType}`, '', content, `--${boundary}--`,
  ].join('\r\n');
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: multipart, signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Drive upload failed: ${res.status}`);
  const data = await res.json();
  return data.id;
}

async function createBackupSheet(token: string, title: string, headers: string[], rows: any[][]): Promise<string> {
  const headers2 = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST', headers: headers2,
    body: JSON.stringify({ properties: { title } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!createRes.ok) throw new Error(`Sheets create failed: ${createRes.status}`);
  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const values = [headers, ...rows];
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=RAW`, {
    method: 'POST', headers: headers2,
    body: JSON.stringify({ values }),
    signal: AbortSignal.timeout(30000),
  });
  return spreadsheetId;
}

async function createSystemLogDoc(token: string, title: string, content: string, parentId: string): Promise<string> {
  // Create a Google Doc in the backup folder
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
    signal: AbortSignal.timeout(15000),
  });
  if (!createRes.ok) throw new Error(`Docs create failed: ${createRes.status}`);
  const docData = await createRes.json();
  const documentId = docData.documentId;

  // Move the doc into the backup folder
  await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}?addParents=${parentId}&removeParents=root`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10000),
  }).catch(() => {});

  // Add content to the doc
  const lines = content.split('\n');
  const requests: any[] = [];
  let insertIndex = 1;
  for (const line of lines) {
    requests.push({
      insertText: {
        location: { index: insertIndex },
        text: line + '\n',
      },
    });
    insertIndex += line.length + 1;
  }
  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
    signal: AbortSignal.timeout(15000),
  }).catch(() => {});

  return documentId;
}

export async function backupToGoogle(base44: any): Promise<any> {
  const driveToken = await getToken(base44, 'googledrive');
  const sheetsToken = await getToken(base44, 'googlesheets');
  let docsToken: string | null = null;
  try {
    docsToken = await getToken(base44, 'googledocs');
  } catch {}

  const ts = new Date().toISOString().split('T')[0];
  const results: any = { drive: {}, sheets: {}, docs: {}, timestamp: new Date().toISOString() };

  // 1. Create master backup folder structure in Drive
  const masterFolderId = await findOrCreateFolder(driveToken, 'ApexForge Backups');
  const packsFolderId = await findOrCreateFolder(driveToken, `Packs - ${ts}`, masterFolderId);
  const logsFolderId = await findOrCreateFolder(driveToken, `System Logs - ${ts}`, masterFolderId);

  // 2. Back up Packs (preview_html) to Google Drive as HTML files
  let packsBackedUp = 0;
  try {
    const packsPage = await base44.asServiceRole.entities.Pack.list({ limit: 100 });
    const packs: any[] = packsPage.items || packsPage;
    for (const pack of packs.slice(0, 50)) {
      if (pack.preview_html) {
        try {
          await uploadFileToDrive(driveToken, `${pack.name || pack.id}.html`, pack.preview_html, 'text/html', packsFolderId);
          packsBackedUp++;
        } catch {}
      }
    }
  } catch {}
  results.drive.packs_backed_up = packsBackedUp;
  results.drive.folder_id = packsFolderId;

  // 3. Back up LaunchCampaigns to Google Sheets
  try {
    const campPage = await base44.asServiceRole.entities.LaunchCampaign.list({ limit: 200 });
    const campaigns: any[] = campPage.items || campPage;
    const campHeaders = ['ID', 'Name', 'Status', 'Website Count', 'Page Count', 'Created', 'Updated'];
    const campRows = campaigns.map((c: any) => [
      c.id || '', c.name || '', c.status || '',
      c.website_count || 0, c.page_count || 0,
      c.created_date || '', c.updated_date || '',
    ]);
    const sheetId = await createBackupSheet(sheetsToken, `ApexForge Campaigns - ${ts}`, campHeaders, campRows);
    results.sheets.campaigns = { spreadsheet_id: sheetId, record_count: campaigns.length, url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit` };
  } catch (e: any) {
    results.sheets.campaigns = { error: e.message };
  }

  // 4. Back up SocialPosts to Google Sheets
  try {
    const postsPage = await base44.asServiceRole.entities.SocialPost.list({ limit: 200 });
    const posts: any[] = postsPage.items || postsPage;
    const postHeaders = ['ID', 'Platform', 'Content', 'Status', 'Website ID', 'Created'];
    const postRows = posts.map((p: any) => [
      p.id || '', p.platform || '', (p.content || '').substring(0, 500),
      p.status || '', p.website_id || '', p.created_date || '',
    ]);
    const sheetId = await createBackupSheet(sheetsToken, `ApexForge Social Posts - ${ts}`, postHeaders, postRows);
    results.sheets.social_posts = { spreadsheet_id: sheetId, record_count: posts.length, url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit` };
  } catch (e: any) {
    results.sheets.social_posts = { error: e.message };
  }

  // 5. Back up GeneratedPages to Google Sheets
  try {
    const pagesPage = await base44.asServiceRole.entities.GeneratedPage.list({ limit: 200 });
    const pages: any[] = pagesPage.items || pagesPage;
    const pageHeaders = ['ID', 'URL Slug', 'Location', 'Service', 'Status', 'Compliance Score', 'Website ID'];
    const pageRows = pages.map((p: any) => [
      p.id || '', p.url_slug || '', p.location || '', p.service || '',
      p.status || '', p.compliance_score || 0, p.website_id || '',
    ]);
    const sheetId = await createBackupSheet(sheetsToken, `ApexForge Generated Pages - ${ts}`, pageHeaders, pageRows);
    results.sheets.generated_pages = { spreadsheet_id: sheetId, record_count: pages.length, url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit` };
  } catch (e: any) {
    results.sheets.generated_pages = { error: e.message };
  }

  // 6. Back up SystemInventory to Google Sheets
  try {
    const invPage = await base44.asServiceRole.entities.SystemInventory.list({ limit: 200 });
    const invItems: any[] = invPage.items || invPage;
    const invHeaders = ['System Name', 'Type', 'Category', 'Status', 'Reuse Potential', 'Last Scanned'];
    const invRows = invItems.map((s: any) => [
      s.system_name || '', s.system_type || '', s.category || '',
      s.status || '', s.reuse_potential || '', s.last_scanned_at || '',
    ]);
    const sheetId = await createBackupSheet(sheetsToken, `ApexForge System Inventory - ${ts}`, invHeaders, invRows);
    results.sheets.system_inventory = { spreadsheet_id: sheetId, record_count: invItems.length, url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit` };
  } catch (e: any) {
    results.sheets.system_inventory = { error: e.message };
  }

  // 7. Back up system logs (SystemIssue records) to a Google Doc
  if (docsToken) {
    try {
      const issuesPage = await base44.asServiceRole.entities.SystemIssue.list({ limit: 100, sort: '-created_date' } as any);
      const issues: any[] = issuesPage.items || issuesPage;
      let logContent = `APEXFORGE SYSTEM LOGS - ${ts}\n\nTotal Issues: ${issues.length}\n\n`;
      logContent += '--- RECENT ISSUES ---\n\n';
      for (const issue of issues.slice(0, 50)) {
        logContent += `[${issue.status?.toUpperCase() || 'OPEN'}] ${issue.severity?.toUpperCase() || 'MEDIUM'} - ${issue.title || 'Untitled'}\n`;
        logContent += `Component: ${issue.component || 'N/A'}\n`;
        logContent += `Detected: ${issue.detected_at || issue.created_date || 'N/A'}\n`;
        if (issue.description) logContent += `Description: ${issue.description}\n`;
        if (issue.resolution) logContent += `Resolution: ${issue.resolution}\n`;
        logContent += '\n';
      }
      const docId = await createSystemLogDoc(docsToken, `ApexForge System Logs - ${ts}`, logContent, logsFolderId);
      results.docs.system_logs = { document_id: docId, issue_count: issues.length, url: `https://docs.google.com/document/d/${docId}/edit` };
    } catch (e: any) {
      results.docs.system_logs = { error: e.message };
    }
  }

  return { status: 'backup_complete', ...results };
}

export async function categorizeAssets(base44: any): Promise<any> {
  const { classifyAllSystems } = await import("./systemClassifier.ts");
  const allSystems = classifyAllSystems();

  const existingPage = await base44.asServiceRole.entities.SystemInventory.list({ limit: 500 });
  const existingRecords: any[] = existingPage.items || existingPage;
  const existingMap = new Map(existingRecords.map((r: any) => [r.registry_key, r]));

  const missing = allSystems.filter((s: any) => !existingMap.has(s.registry_key));
  let created = 0;
  for (const system of missing) {
    try {
      await base44.asServiceRole.entities.SystemInventory.create({
        system_name: system.system_name,
        system_type: system.system_type,
        category: system.category,
        subcategory: system.subcategory,
        description: system.description,
        capabilities: JSON.stringify(system.capabilities),
        dependencies: JSON.stringify(system.dependencies),
        reuse_potential: system.reuse_potential,
        classification_confidence: 100,
        status: 'active',
        tags: JSON.stringify(system.tags),
        registry_key: system.registry_key,
        last_scanned_at: new Date().toISOString(),
      });
      created++;
    } catch {}
  }

  let updated = 0;
  const now = new Date().toISOString();
  for (const system of allSystems) {
    const record = existingMap.get(system.registry_key);
    if (record) {
      try {
        await base44.asServiceRole.entities.SystemInventory.update(record.id, {
          last_scanned_at: now,
          status: 'active',
        });
        updated++;
      } catch {}
    }
  }

  return {
    status: 'categorized',
    total_systems: allSystems.length,
    already_cataloged: allSystems.length - missing.length,
    newly_categorized: created,
    updated: updated,
    timestamp: now,
  };
}