export interface LlmPoolLimits {
  maxConcurrent: number;
  perKeyConcurrent: number;
  maxQueue: number;
  queueTimeoutMs: number;
  requestsPerMinute: number;
}

export interface LlmKeyLease {
  key: string;
  slot: number;
  release: () => void;
}

export class LlmPoolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LlmPoolError';
  }
}

export function parseLlmKeys(primary?: string, additional?: string): string[] {
  let extra: unknown = [];
  if (additional?.trim()) {
    try {
      extra = JSON.parse(additional);
    } catch {
      throw new LlmPoolError('LLM_API_KEYS must be a JSON array of strings');
    }
    if (
      !Array.isArray(extra) ||
      !extra.every((key) => typeof key === 'string')
    ) {
      throw new LlmPoolError('LLM_API_KEYS must be a JSON array of strings');
    }
  }
  const keys = [primary ?? '', ...(extra as string[])];
  return [...new Set(keys.map((key) => key.trim()).filter(Boolean))];
}

export class LlmKeyPool {
  private readonly slots: Array<{
    key: string;
    active: number;
    disabled: boolean;
  }>;
  private cursor = 0;
  private waiting = 0;
  private active = 0;
  private cooldownUntil = 0;
  private attempts: number[] = [];

  constructor(
    keys: string[],
    private readonly limits: LlmPoolLimits,
  ) {
    this.slots = keys.map((key) => ({ key, active: 0, disabled: false }));
  }

  getStatus() {
    return {
      configured: this.slots.length,
      enabled: this.slots.filter((slot) => !slot.disabled).length,
      active: this.active,
      waiting: this.waiting,
      providerCoolingDown: Date.now() < this.cooldownUntil,
    };
  }

  disable(slot: number) {
    this.slots[slot].disabled = true;
  }

  pauseProvider(milliseconds: number) {
    this.cooldownUntil = Math.max(
      this.cooldownUntil,
      Date.now() + milliseconds,
    );
  }

  async acquire(deadline: number): Promise<LlmKeyLease> {
    if (Date.now() >= deadline)
      throw new LlmPoolError('LLM request deadline exceeded');
    const admissionDeadline = Math.min(
      deadline,
      Date.now() + this.limits.queueTimeoutMs,
    );
    const immediate = this.tryAcquire();
    if (immediate) return immediate;
    if (this.waiting >= this.limits.maxQueue) {
      throw new LlmPoolError('LLM admission queue is full');
    }
    this.waiting += 1;
    try {
      while (Date.now() < admissionDeadline) {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, Math.min(50, admissionDeadline - Date.now())),
        );
        if (Date.now() >= admissionDeadline) break;
        const lease = this.tryAcquire();
        if (lease) return lease;
      }
      throw new LlmPoolError('LLM admission deadline exceeded');
    } finally {
      this.waiting -= 1;
    }
  }

  private tryAcquire(): LlmKeyLease | undefined {
    const now = Date.now();
    if (now < this.cooldownUntil)
      throw new LlmPoolError('LLM provider is cooling down');
    const available = this.slots.filter((slot) => !slot.disabled);
    if (!available.length) throw new LlmPoolError('No usable LLM credentials');
    this.attempts = this.attempts.filter((at) => at > now - 60000);
    if (this.attempts.length >= this.limits.requestsPerMinute) {
      throw new LlmPoolError('LLM request budget exhausted');
    }
    if (this.active >= this.limits.maxConcurrent) return undefined;
    let selected = -1;
    for (let offset = 0; offset < this.slots.length; offset += 1) {
      const index = (this.cursor + offset) % this.slots.length;
      const slot = this.slots[index];
      if (slot.disabled || slot.active >= this.limits.perKeyConcurrent)
        continue;
      if (selected === -1 || slot.active < this.slots[selected].active)
        selected = index;
    }
    if (selected === -1) return undefined;
    const slot = this.slots[selected];
    this.cursor = (selected + 1) % this.slots.length;
    slot.active += 1;
    this.active += 1;
    this.attempts.push(now);
    let released = false;
    return {
      key: slot.key,
      slot: selected,
      release: () => {
        if (released) return;
        released = true;
        slot.active -= 1;
        this.active -= 1;
      },
    };
  }
}

export function retryAfterMs(value: string | null, now = Date.now()): number {
  if (!value?.trim()) return 30000;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0)
    return Math.max(1000, seconds * 1000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(1000, date - now) : 30000;
}
