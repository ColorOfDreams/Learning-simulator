import { ConfigService } from '@nestjs/config';
import { databaseOptions } from './database-options';

describe('external PostgreSQL configuration', () => {
  it('keeps the existing DB variables compatible', () => {
    expect(
      databaseOptions(
        new ConfigService({ DB_HOST: 'localhost', DB_NAME: 'demo' }),
      ),
    ).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      database: 'demo',
      port: 5432,
      schema: 'public',
      synchronize: true,
      extra: { max: 10 },
    });
  });

  it('uses the Supabase URL, verified TLS, private schema and bounded pool', () => {
    expect(
      databaseOptions(
        new ConfigService({
          DATABASE_URL: 'postgresql://app:example@pooler.example:5432/postgres',
          DB_SSL: 'true',
          DB_SSL_CA: 'CERT\\nLINE',
          DB_SCHEMA: 'scilab',
          DB_POOL_MAX: '5',
        }),
      ),
    ).toMatchObject({
      url: 'postgresql://app:example@pooler.example:5432/postgres',
      ssl: { rejectUnauthorized: true, ca: 'CERT\nLINE' },
      schema: 'scilab',
      synchronize: false,
      extra: { max: 5, options: '-c search_path="scilab",extensions,public' },
    });
  });

  it('rejects unsafe schema names, bad pool sizes and ambiguous URL SSL settings', () => {
    for (const values of [
      { DB_SCHEMA: 'public;DROP SCHEMA' },
      { DB_POOL_MAX: '0' },
      { DB_POOL_MAX: '1.5' },
      { DB_SSL: 'invalid' },
      { DB_SYNCHRONIZE: 'invalid' },
      { DATABASE_URL: 'https://example.com' },
      { DATABASE_URL: 'invalid-secret-value' },
      {
        DATABASE_URL:
          'postgresql://app:example@pooler.example/postgres?sslmode=no-verify',
      },
    ])
      expect(() => databaseOptions(new ConfigService(values))).toThrow();
  });
});
