const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { buildCompareSummary } = require('../services/analyticsService');
const { generateComparison } = require('../services/aiService');

// POST /api/compare
router.post('/', async (req, res, next) => {
  try {
    const { dataset_id_a, dataset_id_b } = req.body;
    if (!dataset_id_a || !dataset_id_b) {
      return res.status(400).json({ error: 'dataset_id_a and dataset_id_b are required' });
    }
    if (dataset_id_a === dataset_id_b) {
      return res.status(400).json({ error: 'Cannot compare a dataset with itself' });
    }

    // Get dataset names
    const dsRes = await pool.query(
      'SELECT id, name FROM datasets WHERE id = ANY($1)',
      [[dataset_id_a, dataset_id_b]]
    );
    const dsMap = {};
    dsRes.rows.forEach((r) => { dsMap[r.id] = r.name; });

    const nameA = dsMap[dataset_id_a] || `Dataset ${dataset_id_a}`;
    const nameB = dsMap[dataset_id_b] || `Dataset ${dataset_id_b}`;

    // Check article counts
    const countsRes = await pool.query(
      `SELECT dataset_id, COUNT(*)::int AS cnt
       FROM articles WHERE dataset_id = ANY($1)
       GROUP BY dataset_id`,
      [[dataset_id_a, dataset_id_b]]
    );
    const counts = {};
    countsRes.rows.forEach((r) => { counts[r.dataset_id] = r.cnt; });

    if ((counts[dataset_id_a] || 0) < 3 || (counts[dataset_id_b] || 0) < 3) {
      return res.status(400).json({ error: 'Each dataset needs at least 3 articles for comparison' });
    }

    const { a, b } = await buildCompareSummary(dataset_id_a, dataset_id_b);

    const claudeA = { ...a, time_series: undefined, all_articles: undefined };
    const claudeB = { ...b, time_series: undefined, all_articles: undefined };

    const { parsed, raw } = await generateComparison(claudeA, claudeB, nameA, nameB);

    await pool.query(
      `INSERT INTO insights (dataset_id, compare_dataset_id, mode, insights_json, raw_response)
       VALUES ($1, $2, 'compare', $3, $4)`,
      [dataset_id_a, dataset_id_b, JSON.stringify(parsed), raw]
    );

    res.json({
      dataset_a: { id: dataset_id_a, name: nameA, analytics: a },
      dataset_b: { id: dataset_id_b, name: nameB, analytics: b },
      ...parsed,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
