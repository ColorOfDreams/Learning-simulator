# ADR-0008 — Deploy the SciLab frontend on Cloudflare Pages

Status: Accepted by the project owner, 2026-11-19.

## Decision

Deploy the UmiJS/React frontend as static assets on Cloudflare Pages, initially
using the generated HTTPS pages.dev domain. Keep the existing NestJS backend on
Render and its Supabase PostgreSQL connection. Set the API URL and existing Google
web client ID at build time. Application credentials stay on the backend.

Use the existing Node 22 / Yarn build and publish only the dist directory. Preserve
SPA navigation and WebAssembly assets used by the simulations. Treat Google
Authorized JavaScript origins as part of deployment verification for the new URL.

Start with a direct upload from a verified local build, which does not require
granting Cloudflare additional GitHub repository permissions. Future releases
may use Wrangler with a separately authorized token. A Pages Direct Upload
project cannot later switch to Git integration; create a separate project if
Git integration becomes necessary.

## Alternatives

A Cloudflare Worker with static assets also serves the frontend, but adds runtime
configuration that is unnecessary for the existing static build. Moving NestJS
and its database connections to Workers requires a separate runtime compatibility
project. Proxying the existing Render frontend would retain its hosting
dependency instead of publishing the build directly to Cloudflare.

## Validation

Build successfully, verify the published index and nested routes, load login and
a simulation in a browser, and confirm API access from the new frontend origin.
Record actual URLs, authentication results and limitations in the deployment
runbook. No DNS changes or paid services are required for the pages.dev release.

## Sources

- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/configuration/serving-pages/
- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
