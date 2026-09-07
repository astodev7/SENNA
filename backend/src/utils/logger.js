'use strict';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const current = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function log(level, message, meta = {}) {
  if (levels[level] > levels[current]) return;
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  // Never log secrets
  if (entry.password) delete entry.password;
  if (entry.token) delete entry.token;
  if (entry.password_hash) delete entry.password_hash;
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else console.log(line);
}

module.exports = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};
