'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });

const app = require('./app');
const logger = require('./utils/logger');
const { cleanupExpiredSessions } = require('./services/authService');

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  logger.info(`AURELIA server listening on port ${PORT}`, {
    env: process.env.NODE_ENV || 'development',
  });
});

// Periodic session cleanup
setInterval(() => {
  cleanupExpiredSessions().catch(() => {});
}, 60 * 60 * 1000);

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});

module.exports = server;
