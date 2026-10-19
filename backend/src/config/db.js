const { Pool } = require('pg');
const { pgConfig } = require('./pgConfig');

const pool = new Pool(pgConfig());

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
