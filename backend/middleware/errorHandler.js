function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message || err);

  if (err.isJoi) {
    return res.status(400).json({ error: err.details[0].message });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
