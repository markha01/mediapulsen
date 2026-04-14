const pool = require('../db/connection');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function buildSummary(datasetId) {
  const client = await pool.connect();
  try {
    // Basic stats
    const statsRes = await client.query(
      `SELECT
         COUNT(*)::int                          AS total_articles,
         MIN(published_at)                      AS date_from,
         MAX(published_at)                      AS date_to,
         ROUND(AVG(conversion_rate)::numeric, 4) AS avg_conversion_rate,
         ROUND(AVG(time_on_page)::numeric, 1)   AS avg_time_on_page,
         SUM(views)::int                        AS total_views,
         SUM(conversions)::int                  AS total_conversions
       FROM articles WHERE dataset_id = $1`,
      [datasetId]
    );
    const stats = statsRes.rows[0];

    // By publish day
    const dayRes = await client.query(
      `SELECT
         publish_day,
         COUNT(*)::int                          AS article_count,
         ROUND(AVG(conversion_rate)::numeric, 4) AS avg_cvr,
         SUM(conversions)::int                  AS total_conversions
       FROM articles
       WHERE dataset_id = $1
       GROUP BY publish_day
       ORDER BY publish_day`,
      [datasetId]
    );
    const byPublishDay = dayRes.rows.map((r) => ({
      day: DAY_NAMES[r.publish_day],
      day_index: r.publish_day,
      article_count: r.article_count,
      avg_cvr: parseFloat(r.avg_cvr),
      total_conversions: r.total_conversions,
    }));

    // Top 10 articles by conversions
    const topRes = await client.query(
      `SELECT title, views, conversions, conversion_rate::float AS cvr, time_on_page
       FROM articles
       WHERE dataset_id = $1
       ORDER BY conversions DESC
       LIMIT 10`,
      [datasetId]
    );
    const topArticles = topRes.rows;

    // Bottom 5 by CVR (at least some views)
    const bottomRes = await client.query(
      `SELECT title, views, conversions, conversion_rate::float AS cvr, time_on_page
       FROM articles
       WHERE dataset_id = $1 AND views > 0
       ORDER BY conversion_rate ASC
       LIMIT 5`,
      [datasetId]
    );
    const bottomArticles = bottomRes.rows;

    // Time on page segments
    const segRes = await client.query(
      `SELECT
         CASE
           WHEN time_on_page < 60   THEN '<60s'
           WHEN time_on_page <= 120 THEN '60-120s'
           ELSE '>120s'
         END AS segment,
         COUNT(*)::int                          AS article_count,
         ROUND(AVG(conversion_rate)::numeric, 4) AS avg_cvr
       FROM articles
       WHERE dataset_id = $1
       GROUP BY 1
       ORDER BY 1`,
      [datasetId]
    );
    const timeOnPageSegments = segRes.rows.map((r) => ({
      segment: r.segment,
      article_count: r.article_count,
      avg_cvr: parseFloat(r.avg_cvr),
    }));

    // Time series (views + conversions per day)
    const tsRes = await client.query(
      `SELECT
         published_at::text AS date,
         SUM(views)::int    AS views,
         SUM(conversions)::int AS conversions,
         ROUND(AVG(conversion_rate)::numeric, 4) AS avg_cvr
       FROM articles
       WHERE dataset_id = $1
       GROUP BY published_at
       ORDER BY published_at`,
      [datasetId]
    );
    const timeSeries = tsRes.rows;

    // All articles for CVR chart
    const allRes = await client.query(
      `SELECT title, views, conversions, conversion_rate::float AS cvr, time_on_page, published_at::text AS date
       FROM articles
       WHERE dataset_id = $1
       ORDER BY conversion_rate DESC`,
      [datasetId]
    );
    const allArticles = allRes.rows;

    return {
      total_articles: stats.total_articles,
      date_range: { from: stats.date_from, to: stats.date_to },
      avg_conversion_rate: parseFloat(stats.avg_conversion_rate),
      avg_time_on_page: parseFloat(stats.avg_time_on_page),
      total_views: stats.total_views,
      total_conversions: stats.total_conversions,
      by_publish_day: byPublishDay,
      top_articles: topArticles,
      bottom_articles: bottomArticles,
      time_on_page_segments: timeOnPageSegments,
      time_series: timeSeries,
      all_articles: allArticles,
    };
  } finally {
    client.release();
  }
}

async function buildCompareSummary(datasetIdA, datasetIdB) {
  const [a, b] = await Promise.all([buildSummary(datasetIdA), buildSummary(datasetIdB)]);
  return { a, b };
}

module.exports = { buildSummary, buildCompareSummary };
