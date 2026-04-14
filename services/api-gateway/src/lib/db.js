'use strict';

const { Pool } = require('pg');

const db = new Pool({
  connectionString: process.env.DB_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

module.exports = { db };
