# ADR-0009 — Check API and database readiness every five minutes

Status: Accepted by the project owner, 2026-11-25.

## Decision

Deploy a separate Cloudflare Worker with a five-minute Cron Trigger. Each run
requests the persistent Render API at GET /health/ready, with a 90-second timeout
to accommodate an initial cold start. The endpoint uses the application's
existing TypeORM connection to execute SELECT 1. It returns HTTP 200 only after
the query succeeds, or a generic HTTP 503 when the database is unavailable.

Readiness responses disable HTTP caching. The Worker also bypasses cache and
validates the JSON response, so an HTTP loading page cannot count as success.
Log only HTTP status, elapsed time and the readiness result; never credentials,
user data or upstream response bodies. A failed check marks the scheduled run
as failed. No LLM calls, Google logins or database writes occur.

The Worker has no public HTTP route. Source and its schedule live in
src/keepalive, separately from the static Pages frontend. This monitor executes
on Cloudflare, independently of the developer's machine or open browser tabs.

## Limits

Inbound requests reduce Render's inactivity-based spin-down; they do not remove
Free plan runtime limits or guarantee availability. Database checks confirm
connectivity; they do not guarantee exemption from Supabase's Free plan policies.
These checks cannot renew expired login tokens or revive revoked API keys.

## Sources

- https://developers.cloudflare.com/workers/configuration/cron-triggers/
- https://render.com/docs/free
- https://supabase.com/docs/guides/platform/going-into-prod
