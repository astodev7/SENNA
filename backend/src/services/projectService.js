'use strict';

const { pool } = require('../database/pool');

async function listPublic({ category, featured } = {}) {
  let sql = `
    SELECT id, slug, title, category, summary, cover_image, is_featured, technologies, created_at
    FROM projects
    WHERE is_published = true
  `;
  const params = [];
  if (category && category !== 'Todos') {
    params.push(category);
    sql += ` AND category = $${params.length}`;
  }
  if (featured === true || featured === 'true') {
    sql += ' AND is_featured = true';
  }
  sql += ' ORDER BY sort_order ASC, created_at DESC';
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function getBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT * FROM projects WHERE slug = $1 AND is_published = true`,
    [slug]
  );
  if (rows.length === 0) return null;
  const project = rows[0];
  const { rows: images } = await pool.query(
    'SELECT id, url, alt_text, sort_order FROM project_images WHERE project_id = $1 ORDER BY sort_order',
    [project.id]
  );
  project.images = images;
  return project;
}

async function listAdmin() {
  const { rows } = await pool.query(
    `SELECT id, slug, title, category, is_published, is_featured, sort_order, created_at, updated_at
     FROM projects ORDER BY sort_order ASC, created_at DESC`
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  if (rows.length === 0) return null;
  const project = rows[0];
  const { rows: images } = await pool.query(
    'SELECT id, url, alt_text, sort_order FROM project_images WHERE project_id = $1 ORDER BY sort_order',
    [project.id]
  );
  project.images = images;
  return project;
}

async function create(data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO projects (
      slug, title, category, summary, description, problem, context, solution,
      architecture, technologies, results, cover_image, is_published, is_featured,
      sort_order, meta_title, meta_description
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    RETURNING *`,
    [
      data.slug, data.title, data.category, data.summary || null, data.description || null,
      data.problem || null, data.context || null, data.solution || null,
      data.architecture || null, data.technologies || [], data.results || null,
      data.cover_image || null, data.is_published ?? false, data.is_featured ?? false,
      data.sort_order ?? 0, data.meta_title || null, data.meta_description || null,
    ]
  );
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'CREATE_PROJECT', 'project', $2, $3)`,
    [userId, rows[0].id, JSON.stringify({ slug: data.slug, title: data.title })]
  );
  return rows[0];
}

async function update(id, data, userId) {
  const fields = [];
  const values = [];
  const allowed = [
    'slug', 'title', 'category', 'summary', 'description', 'problem', 'context',
    'solution', 'architecture', 'technologies', 'results', 'cover_image',
    'is_published', 'is_featured', 'sort_order', 'meta_title', 'meta_description',
  ];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      values.push(data[key]);
      fields.push(`${key} = $${values.length}`);
    }
  }
  if (fields.length === 0) return getById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE projects SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );
  if (rows.length === 0) return null;
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'UPDATE_PROJECT', 'project', $2, $3)`,
    [userId, id, JSON.stringify({ fields: Object.keys(data) })]
  );
  return rows[0];
}

async function remove(id, userId) {
  const { rows } = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id, slug', [id]);
  if (rows.length === 0) return false;
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'DELETE_PROJECT', 'project', $2, $3)`,
    [userId, id, JSON.stringify({ slug: rows[0].slug })]
  );
  return true;
}

module.exports = { listPublic, getBySlug, listAdmin, getById, create, update, remove };
