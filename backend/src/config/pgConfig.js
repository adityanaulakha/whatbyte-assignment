function pgConfig() {
  const connectionString = process.env.DATABASE_URL;
  const isLocal =
    !connectionString ||
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1');

  return {
    connectionString,
    // Render (and most cloud Postgres) require SSL for external connections
    ssl: isLocal ? false : { rejectUnauthorized: false },
  };
}

module.exports = { pgConfig };
