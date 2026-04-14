const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { buildSummary } = require('../services/analyticsService');
const { generateInsights } = require('../services/aiService');
const { storeReport } = require('../services/minioService');

// POST /api/insights/generate
router.post('/generate', async (req, res, next) => {
  try {
    const { dataset_id } = req.body;
    if (!dataset_id) return res.status(400).json({ error: 'dataset_id is required' });

    const countRes = await pool.query(
      'SELECT COUNT(*) FROM articles WHERE dataset_id = $1',
      [dataset_id]
    );
    const articleCount = parseInt(countRes.rows[0].count, 10);
    if (articleCount < 3) {
      return res.status(400).json({
        error: `Need at least 3 articles to generate insights (found ${articleCount})`,
      });
    }

    const summary = await buildSummary(dataset_id);

    // Strip heavy arrays before sending to Claude (keep top/bottom/segments)
    const claudeSummary = {
      total_articles: summary.total_articles,
      date_range: summary.date_range,
      avg_conversion_rate: summary.avg_conversion_rate,
      avg_time_on_page: summary.avg_time_on_page,
      total_views: summary.total_views,
      total_conversions: summary.total_conversions,
      by_publish_day: summary.by_publish_day,
      top_articles: summary.top_articles,
      bottom_articles: summary.bottom_articles,
      time_on_page_segments: summary.time_on_page_segments,
    };

    const { parsed, raw } = await generateInsights(claudeSummary);

    const insertRes = await pool.query(
      `INSERT INTO insights (dataset_id, mode, insights_json, raw_response)
       VALUES ($1, 'single', $2, $3)
       RETURNING id, generated_at`,
      [dataset_id, JSON.stringify(parsed), raw]
    );

    const insightId = insertRes.rows[0].id;

    // Phase 2: persist report to MinIO (best-effort)
    storeReport(dataset_id, insightId, { ...parsed, analytics: summary })
      .catch((err) => console.warn('[phase2] report storage error:', err.message));

    res.json({
      insight_id: insightId,
      generated_at: insertRes.rows[0].generated_at,
      ...parsed,
      analytics: summary,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/insights?dataset_id=:id
router.get('/', async (req, res, next) => {
  try {
    const { dataset_id } = req.query;
    if (!dataset_id) return res.status(400).json({ error: 'dataset_id is required' });

    const result = await pool.query(
      `SELECT id, insights_json, generated_at
       FROM insights
       WHERE dataset_id = $1 AND mode = 'single'
       ORDER BY generated_at DESC
       LIMIT 1`,
      [dataset_id]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    const row = result.rows[0];
    res.json({
      insight_id: row.id,
      generated_at: row.generated_at,
      ...row.insights_json,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
