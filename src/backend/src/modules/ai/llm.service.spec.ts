import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiUsageService } from './ai-usage.service';
import { LlmService } from './llm.service';

describe('LlmService credential routing', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });
  async function create() {
    const module = await Test.createTestingModule({
      providers: [
        LlmService,
        {
          provide: ConfigService,
          useValue: new ConfigService({
            LLM_API_KEY: 'first',
            LLM_API_KEYS: '["second","third","fourth","fifth"]',
          }),
        },
        {
          provide: AiUsageService,
          useValue: { log: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();
    return module.get(LlmService);
  }

  it('routes successful generations across all five credentials without exposing keys in metadata', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
          ),
        ),
      );
    global.fetch = fetchMock;
    const service = await create();
    for (let i = 0; i < 5; i++)
      expect(await service.complete([{ role: 'user', content: 'Hi' }])).toBe(
        'ok',
      );
    expect(
      fetchMock.mock.calls.map(([, init]) =>
        new Headers(init?.headers).get('authorization'),
      ),
    ).toEqual([
      'Bearer first',
      'Bearer second',
      'Bearer third',
      'Bearer fourth',
      'Bearer fifth',
    ]);
    expect(service.getPoolStatus()).toEqual({
      configured: 5,
      enabled: 5,
      active: 0,
      waiting: 0,
      providerCoolingDown: false,
    });
  });

  it('tries one alternative after authentication rejection and releases both slots', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(new Response('sensitive body', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
        ),
      );
    global.fetch = fetchMock;
    const service = await create();
    expect(await service.complete([])).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(service.getPoolStatus()).toMatchObject({ enabled: 4, active: 0 });
  });

  it('does not retry 429 on a different key or leak upstream bodies', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValue(
        new Response('secret-provider-body', {
          status: 429,
          headers: { 'Retry-After': '30' },
        }),
      );
    global.fetch = fetchMock;
    const service = await create();
    await expect(service.complete([])).rejects.toThrow(
      'LLM upstream rejected request (429)',
    );
    await expect(service.complete([])).rejects.toThrow('cooling down');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(service.getPoolStatus()).toMatchObject({
      active: 0,
      providerCoolingDown: true,
    });
  });

  it('sanitizes network errors and never duplicates an uncertain generation', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockRejectedValue(new Error('secret echoed by a proxy'));
    global.fetch = fetchMock;
    const service = await create();
    await expect(service.complete([])).rejects.toThrow(
      'LLM upstream unavailable',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(service.getPoolStatus().active).toBe(0);
  });

  it('aborts timed-out upstream work and releases its slot', async () => {
    jest.useFakeTimers();
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockImplementation(
        (_input, init) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener(
              'abort',
              () => reject(new Error('aborted')),
              { once: true },
            );
          }),
      );
    global.fetch = fetchMock;
    const service = await create();
    const pending = service.complete([], { timeoutMs: 100 });
    const assertion = expect(pending).rejects.toThrow('deadline exceeded');
    await jest.advanceTimersByTimeAsync(100);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(service.getPoolStatus().active).toBe(0);
  });
});
