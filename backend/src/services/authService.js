'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../database/pool');
const { hashToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const SESSION_DAYS = 7;

async function login(email, password, meta = {}) {
  const { rows } = await pool.query(
    'SELECT id, email, name, role, password_hash, is_active FROM admin_users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  if (rows.length === 0) {
    const err = new Error('Credenciais inválidas.');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const user = rows[0];
  if (!user.is_active) {
    const err = new Error('Conta desativada.');
    err.status = 403;
    err.code = 'ACCOUNT_DISABLED';
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Credenciais inválidas.');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO sessions (user_id, token_hash, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [user.id, tokenHash, expiresAt, meta.ip || null, meta.userAgent || null]
  );

  await pool.query(
    'UPDATE admin_users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  );

  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
     VALUES ($1, 'LOGIN', 'admin_user', $2, $3, $4)`,
    [user.id, user.id, JSON.stringify({ email: user.email }), meta.ip || null]
  );

  logger.info('Admin login', { userId: user.id, email: user.email });

  return {
    token,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

async function logout(sessionId, userId, meta = {}) {
  await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
  if (userId) {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, 'LOGOUT', 'admin_user', $2, $3)`,
      [userId, userId, meta.ip || null]
    );
  }
  logger.info('Admin logout', { userId });
}

async function cleanupExpiredSessions() {
  await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
}

module.exports = { login, logout, cleanupExpiredSessions };
