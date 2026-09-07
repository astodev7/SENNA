'use strict';

const { pool } = require('../database/pool');

async function listPublic() {
  const { rows: plans } = await pool.query(
    `SELECT id, slug, name, tagline, description, price_label, price_value, currency,
            is_featured, sort_order, cta_label
     FROM plans WHERE is_active = true ORDER BY sort_order ASC`
  );
  for (const plan of plans) {
    const { rows: features } = await pool.query(
      `SELECT feature_key, feature_label, feature_value, is_included, sort_order
       FROM plan_features WHERE plan_id = $1 ORDER BY sort_order`,
      [plan.id]
    );
    plan.features = features;
  }
  return plans;
}

async function listAdmin() {
  const { rows } = await pool.query(
    `SELECT id, slug, name, price_label, is_active, is_featured, sort_order, created_at, updated_at
     FROM plans ORDER BY sort_order ASC`
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM plans WHERE id = $1', [id]);
  if (rows.length === 0) return null;
  const plan = rows[0];
  const { rows: features } = await pool.query(
    `SELECT * FROM plan_features WHERE plan_id = $1 ORDER BY sort_order`,
    [id]
  );
  plan.features = features;
  return plan;
}

async function create(data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO plans (slug, name, tagline, description, price_label, price_value, currency,
                        is_active, is_featured, sort_order, cta_label)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      data.slug, data.name, data.tagline || null, data.description || null,
      data.price_label || 'Sob consulta', data.price_value || null, data.currency || 'BRL',
      data.is_active ?? true, data.is_featured ?? false, data.sort_order ?? 0,
      data.cta_label || 'Falar com a AURELIA',
    ]
  );
  const plan = rows[0];
  if (Array.isArray(data.features)) {
    for (let i = 0; i < data.features.length; i++) {
      const f = data.features[i];
      await pool.query(
        `INSERT INTO plan_features (plan_id, feature_key, feature_label, feature_value, is_included, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [plan.id, f.feature_key || f.key, f.feature_label || f.label, f.feature_value || f.value || null, f.is_included ?? true, i]
      );
    }
  }
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'CREATE_PLAN', 'plan', $2, $3)`,
    [userId, plan.id, JSON.stringify({ slug: plan.slug })]
  );
  return getById(plan.id);
}

async function update(id, data, userId) {
  const fields = [];
  const values = [];
  const allowed = [
    'slug', 'name', 'tagline', 'description', 'price_label', 'price_value',
    'currency', 'is_active', 'is_featured', 'sort_order', 'cta_label',
  ];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      values.push(data[key]);
      fields.push(`${key} = $${values.length}`);
    }
  }
  if (fields.length > 0) {
    values.push(id);
    await pool.query(
      `UPDATE plans SET ${fields.join(', ')} WHERE id = $${values.length}`,
      values
    );
  }
  if (Array.isArray(data.features)) {
    await pool.query('DELETE FROM plan_features WHERE plan_id = $1', [id]);
    for (let i = 0; i < data.features.length; i++) {
      const f = data.features[i];
      await pool.query(
        `INSERT INTO plan_features (plan_id, feature_key, feature_label, feature_value, is_included, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [id, f.feature_key || f.key, f.feature_label || f.label, f.feature_value || f.value || null, f.is_included ?? true, i]
      );
    }
  }
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'UPDATE_PLAN', 'plan', $2, $3)`,
    [userId, id, JSON.stringify({ fields: Object.keys(data) })]
  );
  return getById(id);
}

async function remove(id, userId) {
  const { rows } = await pool.query('DELETE FROM plans WHERE id = $1 RETURNING id, slug', [id]);
  if (rows.length === 0) return false;
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'DELETE_PLAN', 'plan', $2, $3)`,
    [userId, id, JSON.stringify({ slug: rows[0].slug })]
  );
  return true;
}

module.exports = { listPublic, listAdmin, getById, create, update, remove };
