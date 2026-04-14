const { getClickHouseClient } = require('../db/clickhouse');

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS articles (
    id           UInt32,
    dataset_id   UInt32,
    title        String,
    published_at Date,
    views        UInt32,
    time_on_page UInt32,
    conversions  UInt32,
    conversion_rate Float64,
    publish_day  UInt8
  ) ENGINE = MergeTree()
  ORDER BY (dataset_id, published_at, id)
`;

async function ensureTable() {
  const ch = getClickHouseClient();
  if (!ch) return;
  await ch.exec({ query: CREATE_TABLE_SQL });
}

async function insertArticles(rows) {
  const ch = getClickHouseClient();
  if (!ch || !rows.length) return;

  const values = rows.map((r) => ({
    id:              r.id,
    dataset_id:      r.dataset_id,
    title:           r.title,
    published_at:    String(r.published_at).slice(0, 10),
    views:           r.views,
    time_on_page:    r.time_on_page,
    conversions:     r.conversions,
    conversion_rate: parseFloat(r.conversion_rate) || 0,
    publish_day:     r.publish_day,
  }));

  await ch.insert({
    table: 'articles',
    values,
    format: 'JSONEachRow',
  });
}

async function deleteDatasetRows(datasetId) {
  const ch = getClickHouseClient();
  if (!ch) return;
  await ch.exec({
    query: `ALTER TABLE articles DELETE WHERE dataset_id = {datasetId:UInt32}`,
    query_params: { datasetId },
  });
}

module.exports = { ensureTable, insertArticles, deleteDatasetRows };
