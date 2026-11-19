import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function databaseOptions(config: ConfigService): TypeOrmModuleOptions {
  const schema = config.get<string>('DB_SCHEMA') || 'public';
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) {
    throw new Error('DB_SCHEMA must be a lowercase PostgreSQL identifier');
  }
  const poolMax = Number(config.get<string>('DB_POOL_MAX') || 10);
  if (!Number.isSafeInteger(poolMax) || poolMax < 1 || poolMax > 100) {
    throw new Error('DB_POOL_MAX must be an integer between 1 and 100');
  }
  const ssl = config.get<string>('DB_SSL');
  if (ssl && !['true', 'false'].includes(ssl))
    throw new Error('DB_SSL must be true or false');
  const synchronize = config.get<string>('DB_SYNCHRONIZE');
  if (synchronize && !['true', 'false'].includes(synchronize))
    throw new Error('DB_SYNCHRONIZE must be true or false');
  const url = config.get<string>('DATABASE_URL');
  if (url) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
    }
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol))
      throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
    if (parsed.search)
      throw new Error(
        'Set SSL with DB_SSL and DB_SSL_CA, not DATABASE_URL query parameters',
      );
  }
  const ca = config.get<string>('DB_SSL_CA');
  return {
    type: 'postgres',
    ...(url
      ? { url }
      : {
          host: config.get<string>('DB_HOST'),
          port: Number(config.get<string>('DB_PORT') || 5432),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
        }),
    schema,
    ...(ssl === 'true'
      ? {
          ssl: {
            rejectUnauthorized: true,
            ...(ca ? { ca: ca.replace(/\\n/g, '\n') } : {}),
          },
        }
      : {}),
    autoLoadEntities: true,
    synchronize: synchronize ? synchronize === 'true' : !url,
    extra: {
      max: poolMax,
      connectionTimeoutMillis: 15000,
      options: `-c search_path="${schema}",extensions,public`,
    },
  };
}
