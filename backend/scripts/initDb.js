require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { pgConfig } = require('../src/config/pgConfig');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL in .env');
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const client = new Client(pgConfig());
  await client.connect();

  try {
    await client.query(sql);
    console.log('Database schema applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});
