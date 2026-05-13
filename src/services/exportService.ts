import { Platform, Share } from 'react-native';
import RNFS from 'react-native-fs';
import { Location, Container, Item, AppSettings } from '../types';
import { APP_NAME, APP_VERSION } from '../constants';

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return iso;
  }
};

const sanitizeCSV = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// ─── CSV Export ───────────────────────────────────────────────────────────────
export const generateCSV = (
  locations: Location[],
  containers: Container[],
  items: Item[],
  options: { includeNotes: boolean },
): string => {
  const locationMap = Object.fromEntries(locations.map(l => [l.id, l]));
  const containerMap = Object.fromEntries(containers.map(c => [c.id, c]));

  const headers = [
    'Item Name', 'Quantity', 'Category', 'Importance', 'Tags',
    'Location', 'Container',
    ...(options.includeNotes ? ['Notes'] : []),
    'Created Date', 'Updated Date',
  ];

  const rows = items.map(item => {
    const loc = locationMap[item.locationId];
    const con = containerMap[item.containerId];
    const row = [
      sanitizeCSV(item.name),
      sanitizeCSV(item.quantity),
      sanitizeCSV(item.category),
      sanitizeCSV(item.importance),
      sanitizeCSV(item.tags.join('; ')),
      sanitizeCSV(loc?.name ?? '—'),
      sanitizeCSV(con?.name ?? '—'),
      ...(options.includeNotes ? [sanitizeCSV(item.notes)] : []),
      sanitizeCSV(formatDate(item.createdAt)),
      sanitizeCSV(formatDate(item.updatedAt)),
    ];
    return row.join(',');
  });

  const summary = [
    `# ${APP_NAME} Inventory Report`,
    `# Generated: ${new Date().toLocaleString()}`,
    `# Version: ${APP_VERSION}`,
    `# Locations: ${locations.length} | Containers: ${containers.length} | Items: ${items.length}`,
    '',
  ];

  return [...summary, headers.join(','), ...rows].join('\n');
};

// ─── JSON Backup ──────────────────────────────────────────────────────────────
export const generateJSON = (
  locations: Location[],
  containers: Container[],
  items: Item[],
  settings: AppSettings,
): string => {
  return JSON.stringify(
    {
      app: APP_NAME,
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      summary: { locations: locations.length, containers: containers.length, items: items.length },
      locations,
      containers,
      items,
      settings,
    },
    null,
    2,
  );
};

// ─── HTML Report (for readable sharing) ──────────────────────────────────────
export const generateHTMLReport = (
  locations: Location[],
  containers: Container[],
  items: Item[],
  options: { includeNotes: boolean; filterLocationId?: string },
): string => {
  const locationMap = Object.fromEntries(locations.map(l => [l.id, l]));
  const containerMap = Object.fromEntries(containers.map(c => [c.id, c]));

  const filteredItems = options.filterLocationId
    ? items.filter(i => i.locationId === options.filterLocationId)
    : items;

  const filteredContainers = options.filterLocationId
    ? containers.filter(c => c.locationId === options.filterLocationId)
    : containers;

  const filteredLocations = options.filterLocationId
    ? locations.filter(l => l.id === options.filterLocationId)
    : locations;

  const itemsByLocation = filteredLocations.map(loc => ({
    location: loc,
    containers: filteredContainers
      .filter(c => c.locationId === loc.id)
      .map(con => ({
        container: con,
        items: filteredItems.filter(i => i.containerId === con.id),
      })),
  }));

  const importanceColor = (imp: string) =>
    imp === 'high' ? '#EF4444' : imp === 'medium' ? '#F59E0B' : '#10B981';

  const rows = filteredItems.map(item => {
    const loc = locationMap[item.locationId];
    const con = containerMap[item.containerId];
    return `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.category}</td>
        <td><span style="color:${importanceColor(item.importance)};font-weight:600">${item.importance}</span></td>
        <td>${loc?.name ?? '—'}</td>
        <td>${con?.name ?? '—'}</td>
        <td>${item.tags.join(', ') || '—'}</td>
        ${options.includeNotes ? `<td>${item.notes || '—'}</td>` : ''}
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME} Inventory Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a2b5e; background: #f0f7ff; }
    .header { background: linear-gradient(135deg, #0a2472, #1a3a8c); color: white; padding: 32px 24px; }
    .header h1 { font-size: 28px; font-weight: 800; }
    .header h1 span { color: #00b4d8; }
    .header p { margin-top: 4px; opacity: 0.8; font-size: 14px; }
    .stats { display: flex; gap: 16px; padding: 24px; background: white; border-bottom: 1px solid #d1e3f8; }
    .stat { text-align: center; flex: 1; }
    .stat .num { font-size: 28px; font-weight: 800; color: #0a2472; }
    .stat .lbl { font-size: 12px; color: #64748b; margin-top: 2px; }
    .content { padding: 24px; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(10,36,114,0.1); }
    th { background: #0a2472; color: white; padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 600; }
    td { padding: 12px 16px; border-bottom: 1px solid #eef4ff; font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f0f7ff; }
    .footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Stuff<span>Map</span></h1>
    <p>Inventory Report &bull; Generated ${new Date().toLocaleString()} &bull; v${APP_VERSION}</p>
  </div>
  <div class="stats">
    <div class="stat"><div class="num">${filteredLocations.length}</div><div class="lbl">Locations</div></div>
    <div class="stat"><div class="num">${filteredContainers.length}</div><div class="lbl">Containers</div></div>
    <div class="stat"><div class="num">${filteredItems.length}</div><div class="lbl">Items</div></div>
  </div>
  <div class="content">
    <table>
      <thead>
        <tr>
          <th>Item</th><th>Qty</th><th>Category</th><th>Importance</th>
          <th>Location</th><th>Container</th><th>Tags</th>
          ${options.includeNotes ? '<th>Notes</th>' : ''}
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="8" style="text-align:center;padding:40px;color:#94a3b8">No items found</td></tr>'}</tbody>
    </table>
  </div>
  <div class="footer">${APP_NAME} &bull; Your private offline inventory &bull; No cloud, no accounts, no ads</div>
</body>
</html>`;
};

// ─── File save + share ────────────────────────────────────────────────────────
export const exportFile = async (
  content: string,
  filename: string,
  mimeType: string,
): Promise<void> => {
  const path = `${RNFS.CachesDirectoryPath}/${filename}`;
  await RNFS.writeFile(path, content, 'utf8');
  await Share.share({
    title: `${APP_NAME} Export`,
    message: Platform.OS === 'android' ? `Sharing ${filename} from ${APP_NAME}` : content,
    url: Platform.OS === 'ios' ? `file://${path}` : undefined,
  });
};

export const saveToDownloads = async (content: string, filename: string): Promise<string> => {
  const path = `${RNFS.DownloadDirectoryPath}/${filename}`;
  await RNFS.writeFile(path, content, 'utf8');
  return path;
};
