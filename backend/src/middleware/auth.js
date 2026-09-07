'use strict';

const crypto = require('crypto');
const { pool } = require('../database/pool');
const logger = require('../utils/logger');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.aurelia_session || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Autenticação necessária.' },
      });
    }

    const tokenHash = hashToken(token);
    const { rows } = await pool.query(
      `SELECT s.id AS session_id, s.expires_at, u.id, u.email, u.name, u.role, u.is_active
       FROM sessions s
       JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Sessão inválida ou expirada.' },
      });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Conta desativada.' },
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    req.sessionId = user.session_id;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Autenticação necessária.' },
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Permissão insuficiente.' },
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, hashToken };
