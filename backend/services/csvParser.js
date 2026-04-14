const { parse } = require('csv-parse/sync');

const HEADER_MAP = {
  title: 'title',
  headline: 'title',
  article: 'title',
  article_title: 'title',
  date: 'published_at',
  published_at: 'published_at',
  publish_date: 'published_at',
  published: 'published_at',
  views: 'views',
  pageviews: 'views',
  page_views: 'views',
  impressions: 'views',
  time_on_page: 'time_on_page',
  time_on_site: 'time_on_page',
  avg_time: 'time_on_page',
  time: 'time_on_page',
  seconds: 'time_on_page',
  conversions: 'conversions',
  subscribers: 'conversions',
  signups: 'conversions',
  converted: 'conversions',
};

function normalizeHeader(raw) {
  const key = raw.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return HEADER_MAP[key] || key;
}

function parseCsvBuffer(buffer) {
  const records = parse(buffer, {
    columns: (headers) => headers.map(normalizeHeader),
    skip_empty_lines: true,
    trim: true,
    cast: false,
  });

  return records.map((row) => ({
    title: row.title,
    published_at: row.published_at,
    views: parseInt(row.views, 10),
    time_on_page: parseInt(row.time_on_page, 10),
    conversions: parseInt(row.conversions, 10),
  }));
}

module.exports = { parseCsvBuffer };
