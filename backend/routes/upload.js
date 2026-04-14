const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db/connection');
const { parseCsvBuffer } = require('../services/csvParser');
const { articleSchema } = require('../middleware/validateArticle');
const { uploadCsv } = require('../services/minioService');
const { insertArticles } = require('../services/clickhouseSync');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/upload
router.post('/', upload.single('file'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { dataset_id } = req.body;
    if (!dataset_id) return res.status(400).json({ error: 'dataset_id is required' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const rows = parseCsvBuffer(req.file.buffer);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'CSV contains no data rows' });
    }

    // Validate all rows
    const validRows = [];
    const errors = [];
    rows.forEach((row, idx) => {
      const toValidate = { ...row, dataset_id: parseInt(dataset_id, 10) };
      const { error } = articleSchema.validate(toValidate);
      if (error) {
        errors.push({ row: idx + 2, message: error.details[0].message });
      } else {
        validRows.push(row);
      }
    });

    if (errors.length > 0 && validRows.length === 0) {
      return res.status(400).json({ error: 'All rows failed validation', details: errors });
    }

    await client.query('BEGIN');
    for (const row of validRows) {
      await client.query(
        `INSERT INTO articles (dataset_id, title, published_at, views, time_on_page, conversions, source)
         VALUES ($1, $2, $3, $4, $5, $6, 'csv')`,
        [dataset_id, row.title, row.published_at, row.views, row.time_on_page, row.conversions]
      );
    }
    await client.query(
      `INSERT INTO dataset_files (dataset_id, filename, rows_inserted) VALUES ($1, $2, $3)`,
      [dataset_id, req.file.originalname, validRows.length]
    );
    await client.query('COMMIT');

    // Phase 2: store CSV in MinIO and sync inserted rows to ClickHouse (best-effort)
    const insertedRes = await pool.query(
      `SELECT id, dataset_id, title, published_at, views, time_on_page, conversions,
              conversion_rate::float, publish_day
       FROM articles WHERE dataset_id = $1 ORDER BY id DESC LIMIT $2`,
      [dataset_id, validRows.length]
    );
    Promise.all([
      uploadCsv(dataset_id, req.file.originalname, req.file.buffer),
      insertArticles(insertedRes.rows),
    ]).catch((err) => console.warn('[phase2] background sync error:', err.message));

    res.json({
      inserted: validRows.length,
      skipped: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
