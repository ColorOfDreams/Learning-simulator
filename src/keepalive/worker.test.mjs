import assert from "node:assert/strict";
import test from "node:test";
import worker, { checkReadiness } from "./worker.mjs";

const url = "https://example.test/health/ready";

test("accepts readiness JSON and bypasses cached responses", async () => {
  const result = await checkReadiness(url, async (target, options) => {
    assert.equal(target, url);
    assert.equal(options.method, "GET");
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ data: { status: "ok", database: "ok" } });
  });
  assert.equal(result.ok, true);
  assert.equal(result.httpStatus, 200);
});

test("rejects loading HTML, unhealthy JSON, HTTP failures and network errors", async () => {
  for (const response of [
    () => new Response("<html>Starting service</html>"),
    () => Response.json({ data: { status: "ok" } }),
    () => Response.json({ data: { status: "ok", database: "unavailable" } }),
    () => new Response("private upstream details", { status: 503 }),
    () => {
      throw new Error("private connection details");
    },
  ]) {
    const result = await checkReadiness(url, async () => response());
    assert.equal(result.ok, false);
    assert.ok(!JSON.stringify(result).includes("private"));
  }
});

test("failed checks fail the scheduled invocation without logging upstream data", async () => {
  const originalFetch = globalThis.fetch;
  const originalLog = console.log;
  const logs = [];
  try {
    globalThis.fetch = async () =>
      new Response("private upstream data", { status: 503 });
    console.log = (message) => logs.push(message);
    await assert.rejects(
      worker.scheduled({}, { TARGET_URL: url }),
      /readiness check failed/,
    );
    assert.equal(JSON.parse(logs[0]).httpStatus, 503);
    assert.ok(!logs.join("").includes("private upstream data"));
  } finally {
    globalThis.fetch = originalFetch;
    console.log = originalLog;
  }
});
