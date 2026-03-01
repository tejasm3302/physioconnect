import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err?.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Array.isArray(err.issues)
        ? err.issues.map((issue) => ({ path: issue.path, message: issue.message }))
        : []
    });
  }

  const status = err.status || 500;
  const message = status >= 500 && env.nodeEnv === 'production' ? 'Internal Server Error' : (err.message || 'Internal Server Error');
  return res.status(status).json({ error: message });
}