'use strict';

const { pool } = require('../database/pool');

async function listPublic() {
  const { rows } = await pool.query(
    `SELECT id, question, answer, category, sort_order
     FROM faqs WHERE is_active = true ORDER BY sort_order ASC`
  );
  return rows;
}

async function listAdmin() {
  const { rows } = await pool.query(
    `SELECT * FROM faqs ORDER BY sort_order ASC`
  );
  return rows;
}

async function create(data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO faqs (question, answer, category, is_active, sort_order)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [data.question, data.answer, data.category || null, data.is_active ?? true, data.sort_order ?? 0]
  );
  return rows[0];
}

async function update(id, data) {
  const fields = [];
  const values = [];
  for (const key of ['question', 'answer', 'category', 'is_active', 'sort_order']) {
    if (data[key] !== undefined) {
      values.push(data[key]);
      fields.push(`${key} = $${values.length}`);
    }
  }
  if (fields.length === 0) {
    const { rows } = await pool.query('SELECT * FROM faqs WHERE id = $1', [id]);
    return rows[0] || null;
  }
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE faqs SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rows } = await pool.query('DELETE FROM faqs WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}

module.exports = { listPublic, listAdmin, create, update, remove };
