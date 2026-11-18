const { spawn } = require('node:child_process');
const { Client } = require('pg');
const { databaseConfig } = require('./database-config.cjs');

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
let server;
let stopping = false;

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopping = true;
    if (server) server.kill(signal);
    else process.exit(0);
  });
}

async function main() {
  const client = new Client(databaseConfig(process.env));
  try {
    await client.connect();
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    console.log('Demo database: pgvector ready.');
  } finally {
    await client.end();
  }
  if (stopping) return;

  server = spawn(process.execPath, ['dist/src/main.js'], { stdio: 'inherit' });
  server.on('error', () => {
    console.error('Could not launch the demo API.');
    process.exit(1);
  });
  server.on('exit', (code) => process.exit(stopping ? 0 : (code ?? 1)));

  const baseUrl = `http://127.0.0.1:${process.env.PORT || 3000}`;
  let ready = false;
  for (let attempt = 0; attempt < 90 && !stopping; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/learning/health`, {
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      // NestJS is still synchronizing the new database schema.
    }
    await delay(1000);
  }
  if (stopping) return;
  if (!ready) throw new Error('Demo API did not become ready.');
  if (process.env.DEMO_SEED_ON_START === 'false') {
    console.log('Migrated database: startup dataset seed disabled.');
    return;
  }

  const seeded = await fetch(`${baseUrl}/learning/seed`, {
    method: 'POST',
    signal: AbortSignal.timeout(120000),
  });
  if (!seeded.ok)
    throw new Error(
      `Demo learning data initialization failed (${seeded.status}).`,
    );
  const result = await seeded.json();
  console.log(
    'Demo learning data ready:',
    JSON.stringify(result.data?.counts || {}),
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : 'Demo initialization failed.',
  );
  if (server) server.kill('SIGTERM');
  process.exit(1);
});
