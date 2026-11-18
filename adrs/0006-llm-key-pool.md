# ADR-0006 — Bounded pool of LLM credentials for the demo

Status: Accepted for implementation by the project owner, 2026-11-18.

## Context

The owner supplied four ModelAPI credentials and authorized using them with the
existing server credential. All LLM call sites already pass through LlmService.
The existing Render demo has one API process; adding credentials does not create
additional servers or prove independent provider quotas.

## Decision

Keep the existing LLM_BASE_URL/model and request/response contracts. Read additional
credentials from server-only LLM_API_KEYS (JSON array), preserving LLM_API_KEY as
the first credential. Deduplicate credentials. Never log credentials or provider
response bodies. Select among available slots by active requests and round robin.

Bound active calls globally and per credential, waiting callers, the admission
wait, and a global rolling request-per-minute budget. Start conservatively with
8 active calls globally, 2 per key, 32 waiting, a 3-second admission deadline and
30 outbound attempts/minute. Tune only after provider quota and load measurements.
These limits are per API process. Multiple replicas require shared coordination
before claiming a global deployment limit.

On 401/403, disable that key for the process lifetime and allow at most one attempt
on another key within the original deadline. On 429, honor Retry-After with a
shared provider cooldown, without rotating keys to bypass a potentially shared
quota. Server/network failures and timeouts return through existing fallback,
without immediately duplicating generation. Provider failures briefly pause new
attempts. A caller waiting for admission consumes the same total request deadline.

No paid compute, extra server, or Redis purchase is authorized by this change.
No claim of fivefold throughput or 200-user capacity follows from five keys.

## Validation

Mocked tests cover balancing, concurrency/queue bounds, deadlines, shared rate
limit cooldown, credential rejection and sanitization. Perform one short live
generation per credential, then a deployed chat smoke check. Keep live validation
bounded; record only key slot/status, never credential values or secret fragments.
