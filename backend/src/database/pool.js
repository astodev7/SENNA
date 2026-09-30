'use strict';

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  override: true,
});

const connectionString = process.env.DATABASE_URL || '';
const isSupabase =
  connectionString.includes('supabase.co') ||
  connectionString.includes('pooler.supabase.com');

const ssl =
  process.env.DB_SSL === 'false'
    ? false
    : isSupabase || process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false;

const pool = new Pool({
  connectionString,
  ssl,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
  allowExitOnIdle: true,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err.message);
});

module.exports = { pool, query: (text, params) => pool.query(text, params) };
