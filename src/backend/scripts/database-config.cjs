function databaseConfig(env) {
  const schema = env.DB_SCHEMA || 'public';
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) {
    throw new Error('DB_SCHEMA must be a lowercase PostgreSQL identifier');
  }
  const poolMax = Number(env.DB_POOL_MAX || 10);
  if (!Number.isSafeInteger(poolMax) || poolMax < 1 || poolMax > 100) {
    throw new Error('DB_POOL_MAX must be an integer between 1 and 100');
  }
  const sslEnabled = env.DB_SSL === 'true';
  if (env.DB_SSL && !['true', 'false'].includes(env.DB_SSL)) {
    throw new Error('DB_SSL must be true or false');
  }
  if (env.DATABASE_URL) {
    let url;
    try {
      url = new URL(env.DATABASE_URL);
    } catch {
      throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
    }
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
      throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
    }
    // URL ssl parameters otherwise override node-postgres's CA verification.
    if (url.search) {
      throw new Error(
        'Set SSL with DB_SSL and DB_SSL_CA, not DATABASE_URL query parameters',
      );
    }
  }
  const searchPath = `"${schema}",extensions,public`;
  return {
    ...(env.DATABASE_URL
      ? { connectionString: env.DATABASE_URL }
      : {
          host: env.DB_HOST,
          port: Number(env.DB_PORT || 5432),
          user: env.DB_USER,
          password: env.DB_PASSWORD,
          database: env.DB_NAME,
        }),
    ...(sslEnabled
      ? {
          ssl: {
            rejectUnauthorized: true,
            ...(env.DB_SSL_CA
              ? { ca: env.DB_SSL_CA.replace(/\\n/g, '\n') }
              : {}),
          },
        }
      : {}),
    options: `-c search_path=${searchPath}`,
    max: poolMax,
    connectionTimeoutMillis: 15000,
  };
}

module.exports = { databaseConfig };
