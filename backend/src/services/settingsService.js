'use strict';

const { pool } = require('../database/pool');

async function getAll() {
  const { rows } = await pool.query('SELECT key, value FROM site_settings');
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

async function update(data, userId) {
  for (const [key, value] of Object.entries(data)) {
    if (typeof key !== 'string' || key.length > 100) continue;
    await pool.query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, value == null ? null : String(value)]
    );
  }
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, metadata)
     VALUES ($1, 'UPDATE_SETTINGS', 'settings', $2)`,
    [userId, JSON.stringify({ keys: Object.keys(data) })]
  );
  return getAll();
}

module.exports = { getAll, update };
