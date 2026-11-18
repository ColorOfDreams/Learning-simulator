import { LlmKeyPool, parseLlmKeys, retryAfterMs } from './llm-key-pool';

const limits = {
  maxConcurrent: 2,
  perKeyConcurrent: 1,
  maxQueue: 1,
  queueTimeoutMs: 100,
  requestsPerMinute: 10,
};

describe('LLM admission pool', () => {
  afterEach(() => jest.useRealTimers());

  it('deduplicates credentials and rejects malformed secret configuration without echoing it', () => {
    expect(parseLlmKeys('one', '["two","one"," two "]')).toEqual([
      'one',
      'two',
    ]);
    expect(() => parseLlmKeys('', 'secret-value')).toThrow(
      'must be a JSON array',
    );
    expect(() => parseLlmKeys('', '[1]')).toThrow('must be a JSON array');
  });

  it('balances across five keys, bounds active calls and refuses excess queued work', async () => {
    jest.useFakeTimers();
    const pool = new LlmKeyPool(['a', 'b', 'c', 'd', 'e'], limits);
    const first = await pool.acquire(Date.now() + 1000);
    const second = await pool.acquire(Date.now() + 1000);
    expect([first.slot, second.slot]).toEqual([0, 1]);
    const pending = pool.acquire(Date.now() + 1000);
    await expect(pool.acquire(Date.now() + 1000)).rejects.toThrow(
      'queue is full',
    );
    expect(pool.getStatus()).toMatchObject({ active: 2, waiting: 1 });
    first.release();
    await jest.advanceTimersByTimeAsync(50);
    const third = await pending;
    expect(third.slot).toBe(2);
    second.release();
    third.release();
    third.release();
    const fourth = await pool.acquire(Date.now() + 1000);
    fourth.release();
    const fifth = await pool.acquire(Date.now() + 1000);
    fifth.release();
    expect([fourth.slot, fifth.slot]).toEqual([3, 4]);
    expect(pool.getStatus()).toMatchObject({ active: 0, waiting: 0 });
  });

  it('expires queued calls without leaking permits', async () => {
    jest.useFakeTimers();
    const pool = new LlmKeyPool(['a'], limits);
    const first = await pool.acquire(Date.now() + 1000);
    const pending = pool.acquire(Date.now() + 40);
    const assertion = expect(pending).rejects.toThrow('deadline exceeded');
    await jest.advanceTimersByTimeAsync(40);
    await assertion;
    expect(pool.getStatus()).toMatchObject({ active: 1, waiting: 0 });
    first.release();
    await expect(pool.acquire(Date.now() - 1)).rejects.toThrow(
      'deadline exceeded',
    );
  });

  it('honors a shared provider cooldown and does not route around it', async () => {
    jest.useFakeTimers();
    const pool = new LlmKeyPool(['a', 'b'], limits);
    pool.pauseProvider(3000);
    await expect(pool.acquire(Date.now() + 4000)).rejects.toThrow(
      'cooling down',
    );
    await jest.advanceTimersByTimeAsync(3000);
    const lease = await pool.acquire(Date.now() + 1000);
    pool.disable(lease.slot);
    lease.release();
    expect((await pool.acquire(Date.now() + 1000)).slot).toBe(1);
  });

  it('bounds outbound attempts across credentials and parses provider retry deadlines', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-18T00:00:00Z'));
    const pool = new LlmKeyPool(['a', 'b'], {
      ...limits,
      requestsPerMinute: 1,
    });
    const lease = await pool.acquire(Date.now() + 1000);
    lease.release();
    await expect(pool.acquire(Date.now() + 1000)).rejects.toThrow(
      'budget exhausted',
    );
    await jest.advanceTimersByTimeAsync(60000);
    expect((await pool.acquire(Date.now() + 1000)).slot).toBe(1);
    expect(retryAfterMs('12')).toBe(12000);
    expect(retryAfterMs(new Date(Date.now() + 10000).toUTCString())).toBe(
      10000,
    );
    expect(retryAfterMs('invalid')).toBe(30000);
  });

  it('keeps a 200-request burst bounded instead of allocating 200 upstream calls', async () => {
    const pool = new LlmKeyPool(['a', 'b', 'c', 'd', 'e'], {
      maxConcurrent: 8,
      perKeyConcurrent: 2,
      maxQueue: 32,
      queueTimeoutMs: 1000,
      requestsPerMinute: 1000,
    });
    let peak = 0;
    const outcomes = await Promise.allSettled(
      Array.from({ length: 200 }, async () => {
        const lease = await pool.acquire(Date.now() + 2000);
        peak = Math.max(peak, pool.getStatus().active);
        await new Promise<void>((resolve) => setTimeout(resolve, 5));
        lease.release();
      }),
    );
    expect(peak).toBe(8);
    expect(
      outcomes.filter((outcome) => outcome.status === 'fulfilled'),
    ).toHaveLength(40);
    expect(
      outcomes.filter((outcome) => outcome.status === 'rejected'),
    ).toHaveLength(160);
    expect(pool.getStatus()).toMatchObject({ active: 0, waiting: 0 });
  });
});
