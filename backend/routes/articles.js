const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { validateArticle } = require('../middleware/validateArticle');

// GET /api/articles?dataset_id=:id
router.get('/', async (req, res, next) => {
  try {
    const { dataset_id } = req.query;
    if (!dataset_id) return res.status(400).json({ error: 'dataset_id is required' });

    const result = await pool.query(
      `SELECT id, title, published_at, views, time_on_page, conversions,
              conversion_rate::float, publish_day, source, created_at
       FROM articles WHERE dataset_id = $1 ORDER BY published_at DESC`,
      [dataset_id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/articles (manual entry)
router.post('/', validateArticle, async (req, res, next) => {
  try {
    const { dataset_id, title, published_at, views, time_on_page, conversions } = req.body;

    const result = await pool.query(
      `INSERT INTO articles (dataset_id, title, published_at, views, time_on_page, conversions, source)
       VALUES ($1, $2, $3, $4, $5, $6, 'manual')
       RETURNING id, title, published_at, views, time_on_page, conversions,
                 conversion_rate::float, publish_day, source`,
      [dataset_id, title, published_at, views, time_on_page, conversions]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/articles/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM articles WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
