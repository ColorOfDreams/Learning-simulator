# ADR-0007 — Move the demo database to Supabase PostgreSQL

Status: Accepted for preparation by the project owner, 2026-11-18. Cutover is
conditional on a successful backup, restored-data verification and application
smoke tests.

## Decision

Use Supabase as managed PostgreSQL, retaining NestJS/TypeORM, the existing auth
and the API contracts. Use the session pooler for the persistent backend when
IPv4 is required, verified TLS, a bounded application pool and a dedicated
non-exposed schema. Do not migrate to Supabase Auth or expose existing user
tables via the browser Data API as part of this change.

Support DATABASE_URL, DB_SSL, DB_SSL_CA, DB_SCHEMA, DB_POOL_MAX and
DB_SYNCHRONIZE. Preserve DB_HOST/PORT/USER/PASSWORD/NAME for existing deployments.
Raw SQL resolves unqualified tables using the configured schema search path.
The Supabase application database must be initialized and restored before
DB_SYNCHRONIZE=false is enabled. Disable automatic demo seed for migrated data.

Keep a full source backup and retain the old Render database for rollback. Use
native PostgreSQL dump/restore tools with versions compatible with the source;
copy application schemas only, never overwrite Supabase-managed schemas. Verify
table counts and critical records without printing personal data or credentials.
Do not drop or pause the source database as an automatic cleanup step.

## Alternatives

Replacing TypeORM with the Supabase REST client would require rewriting queries
and authorization while adding no benefit to the requested database move.
Keeping application tables in an exposed public schema would require additional
API grants/RLS review; a private schema avoids unintentionally exposing these
tables during migration. A transaction pooler is intended for a different
connection lifecycle; session mode is a simpler fit for this long-lived backend.

## Sources

- https://supabase.com/docs/guides/database/connecting-to-postgres
- https://supabase.com/docs/guides/database/extensions/pgvector
- https://supabase.com/kb/guides/migrate-from-render
