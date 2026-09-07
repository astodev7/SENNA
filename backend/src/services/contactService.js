'use strict';

const { pool } = require('../database/pool');

function sanitize(str, max = 2000) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, max).replace(/[<>]/g, '');
}

async function create(data, meta = {}) {
  const name = sanitize(data.name, 255);
  const company = sanitize(data.company || '', 255);
  const email = sanitize(data.email, 255).toLowerCase();
  const phone = sanitize(data.phone || '', 50);
  const projectType = sanitize(data.project_type || data.projectType || '', 100);
  const budget = sanitize(data.budget || '', 100);
  const message = sanitize(data.message, 5000);

  if (!name || name.length < 2) {
    const err = new Error('Nome inválido.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const err = new Error('E-mail inválido.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  if (!message || message.length < 10) {
    const err = new Error('Mensagem muito curta.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  // Honeypot
  if (data.website || data.honeypot) {
    // Silent success for bots
    return { id: null, success: true };
  }

  const { rows } = await pool.query(
    `INSERT INTO contacts (name, company, email, phone, project_type, budget, message, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, created_at`,
    [name, company || null, email, phone || null, projectType || null, budget || null, message, meta.ip || null, meta.userAgent || null]
  );

  return { id: rows[0].id, created_at: rows[0].created_at, success: true };
}

async function listAdmin({ status, search, limit = 50, offset = 0 } = {}) {
  let sql = `SELECT id, name, company, email, phone, project_type, budget, status, created_at, updated_at
             FROM contacts WHERE 1=1`;
  const params = [];
  if (status) {
    params.push(status);
    sql += ` AND status = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR company ILIKE $${params.length})`;
  }
  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(Math.min(limit, 100), offset);
  const { rows } = await pool.query(sql, params);

  let countSql = 'SELECT COUNT(*)::int AS total FROM contacts WHERE 1=1';
  const countParams = [];
  if (status) {
    countParams.push(status);
    countSql += ` AND status = $${countParams.length}`;
  }
  if (search) {
    countParams.push(`%${search}%`);
    countSql += ` AND (name ILIKE $${countParams.length} OR email ILIKE $${countParams.length} OR company ILIKE $${countParams.length})`;
  }
  const { rows: countRows } = await pool.query(countSql, countParams);
  return { items: rows, total: countRows[0].total };
}

async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM contacts WHERE id = $1', [id]);
  return rows[0] || null;
}

async function updateStatus(id, status, notes, userId) {
  const allowed = ['novo', 'em_analise', 'contato_realizado', 'proposta', 'fechado', 'arquivado'];
  if (!allowed.includes(status)) {
    const err = new Error('Status inválido.');
    err.status = 400;
    throw err;
  }
  const { rows } = await pool.query(
    `UPDATE contacts SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 RETURNING *`,
    [status, notes || null, id]
  );
  if (rows.length === 0) return null;
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'UPDATE_LEAD', 'contact', $2, $3)`,
    [userId, id, JSON.stringify({ status })]
  );
  return rows[0];
}

module.exports = { create, listAdmin, getById, updateStatus };
