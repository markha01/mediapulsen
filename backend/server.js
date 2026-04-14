require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { ensureTable } = require('./services/clickhouseSync');

const datasetsRouter = require('./routes/datasets');
const articlesRouter = require('./routes/articles');
const uploadRouter = require('./routes/upload');
const insightsRouter = require('./routes/insights');
const compareRouter = require('./routes/compare');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/datasets', datasetsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/compare', compareRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve built React frontend (production)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Mediapulsen backend running on http://localhost:${PORT}`);
  ensureTable().catch((err) => console.warn('[clickhouse] table init failed:', err.message));
});
