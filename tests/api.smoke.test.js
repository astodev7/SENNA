'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

// Smoke tests assume server may not be running; they validate module load.
describe('AURELIA modules', () => {
  it('loads app without throwing', () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost/aurelia';
    process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-secret-min-32-characters-long';
    const app = require('../backend/src/app');
    assert.ok(app);
  });
});
