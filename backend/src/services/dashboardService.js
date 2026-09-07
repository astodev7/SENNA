'use strict';

const { pool } = require('../database/pool');

async function getStats() {
  const [
    contactsTotal,
    contactsNew,
    projectsPublished,
    projectsFeatured,
    plansActive,
    recentContacts,
    recentLogs,
  ] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS c FROM contacts'),
    pool.query(`SELECT COUNT(*)::int AS c FROM contacts WHERE status = 'novo'`),
    pool.query('SELECT COUNT(*)::int AS c FROM projects WHERE is_published = true'),
    pool.query('SELECT COUNT(*)::int AS c FROM projects WHERE is_featured = true'),
    pool.query('SELECT COUNT(*)::int AS c FROM plans WHERE is_active = true'),
    pool.query(
      `SELECT id, name, company, email, status, created_at
       FROM contacts ORDER BY created_at DESC LIMIT 8`
    ),
    pool.query(
      `SELECT a.action, a.entity_type, a.created_at, u.name AS user_name
       FROM audit_logs a
       LEFT JOIN admin_users u ON u.id = a.user_id
       ORDER BY a.created_at DESC LIMIT 10`
    ),
  ]);

  return {
    leads_total: contactsTotal.rows[0].c,
    leads_new: contactsNew.rows[0].c,
    projects_published: projectsPublished.rows[0].c,
    projects_featured: projectsFeatured.rows[0].c,
    plans_active: plansActive.rows[0].c,
    recent_leads: recentContacts.rows,
    recent_activity: recentLogs.rows,
  };
}

module.exports = { getStats };
