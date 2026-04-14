const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/datasets
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM datasets ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/datasets
router.post('/', async (req, res, next) => {
  try {
    const { name, description, source = 'csv' } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const result = await pool.query(
      'INSERT INTO datasets (name, description, source) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, source]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/datasets/:id/files
router.get('/:id/files', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, filename, rows_inserted, uploaded_at FROM dataset_files WHERE dataset_id = $1 ORDER BY uploaded_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/datasets/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM datasets WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
