const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'has', 'have',
  'had', 'will', 'would', 'could', 'should', 'may', 'might', 'do', 'does',
  'did', 'not', 'no', 'so', 'if', 'as', 'by', 'from', 'that', 'this',
  'it', 'its', 'we', 'you', 'he', 'she', 'they', 'what', 'how', 'why',
  'when', 'where', 'who', 'which', 'after', 'before', 'about', 'more', 'than',
]);

export function extractKeywords(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

export function previewCsv(text, maxRows = 5) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1, maxRows + 1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
  return { headers, rows, totalLines: lines.length - 1 };
}
