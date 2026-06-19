// Centralized error handler. Multer and other libs throw errors with `code` / `status`.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Multer errors
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large.' });
  }

  // Mongoose validation
  if (err && err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed.',
      details: Object.fromEntries(
        Object.entries(err.errors).map(([k, v]) => [k, v.message])
      ),
    });
  }

  // Duplicate key
  if (err && err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value.', keyValue: err.keyValue });
  }

  console.error('[error]', err);
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal server error.' });
}

module.exports = errorHandler;
