function pgConfig() {
  const connectionString = process.env.DATABASE_URL || '';

  // Local Postgres: no SSL
  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1');

  // Render External URLs (*.render.com) require SSL.
  // Render Internal URLs (private hostname, no render.com) must NOT use SSL.
  const needsSsl =
    !isLocal &&
    (connectionString.includes('render.com') ||
      connectionString.includes('sslmode=require') ||
      process.env.PGSSL === 'true');

  return {
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  };
}

module.exports = { pgConfig };
