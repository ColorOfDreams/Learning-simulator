export async function checkReadiness(targetUrl, request = fetch) {
  const started = Date.now();
  try {
    const response = await request(targetUrl, {
      method: "GET",
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(90000),
    });
    let ready = false;
    if (response.ok) {
      const body = await response.json();
      ready = body?.data?.status === "ok" && body?.data?.database === "ok";
    }
    return {
      ok: ready,
      httpStatus: response.status,
      elapsedMs: Date.now() - started,
    };
  } catch {
    return { ok: false, httpStatus: null, elapsedMs: Date.now() - started };
  }
}

export default {
  async scheduled(_controller, env) {
    const result = await checkReadiness(env.TARGET_URL);
    console.log(JSON.stringify({ check: "api_database_readiness", ...result }));
    if (!result.ok) throw new Error("API/database readiness check failed");
  },
};
