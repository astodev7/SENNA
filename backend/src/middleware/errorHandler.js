'use strict';

const logger = require('../utils/logger');

function notFound(req, res, next) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Recurso não encontrado.',
    },
  });
}

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 400 ? 'BAD_REQUEST' : status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');

  logger.error(err.message || 'Unhandled error', {
    code,
    status,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  res.status(status).json({
    error: {
      code,
      message: status === 500 && process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor.'
        : err.message || 'Erro interno do servidor.',
      details: err.details || undefined,
    },
  });
}

module.exports = { notFound, errorHandler };
