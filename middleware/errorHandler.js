function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (err.code === 'P2025') {
    return res.status(404).json({ status: 'fail', message: 'Record not found' });
  }

  if (err.name === 'ZodError') {
    return res.status(422).json({
      status: 'fail',
      message: 'Validation failed',
      errors: err.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  res.status(statusCode).json({ status: statusCode >= 500 ? 'error' : 'fail', message });
}

module.exports = errorHandler;
