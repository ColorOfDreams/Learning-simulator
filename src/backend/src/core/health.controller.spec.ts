import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('database readiness', () => {
  const query = jest.fn<Promise<unknown>, [string]>();
  let controller: HealthController;

  beforeEach(async () => {
    query.mockReset();
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DataSource, useValue: { query } }],
    }).compile();
    controller = module.get(HealthController);
  });

  it('reports readiness after a database round trip', async () => {
    query.mockResolvedValue([{ '?column?': 1 }]);
    await expect(controller.ready()).resolves.toEqual({
      status: 'ok',
      database: 'ok',
    });
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('returns a generic 503 without exposing the connection error', async () => {
    query.mockRejectedValue(new Error('password=private-credential'));
    const result: unknown = await controller
      .ready()
      .catch((error: unknown) => error);
    expect(result).toBeInstanceOf(ServiceUnavailableException);
    if (!(result instanceof ServiceUnavailableException)) {
      throw new Error('Expected an unavailable response');
    }
    expect(result.getStatus()).toBe(503);
    expect(JSON.stringify(result.getResponse())).not.toContain(
      'private-credential',
    );
  });
});
