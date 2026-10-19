const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  return next();
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === '23505') {
    return res.status(409).json({ detail: 'A record with this unique value already exists.' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ detail: 'Related record not found.' });
  }

  const status = err.status || 500;
  const detail = err.message || 'Internal server error.';
  return res.status(status).json({ detail });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { validate, errorHandler, asyncHandler };
