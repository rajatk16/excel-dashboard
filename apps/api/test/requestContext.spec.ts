import { setTimeout } from 'node:timers/promises';

import { RequestContextService } from '../src/common/services/requestContext.service';


describe('RequestContextService', () => {
  let service: RequestContextService;

  beforeEach(() => {
    service = new RequestContextService();
  });

  it('returns undefined outside a request context', () => {
    expect(service.getContext()).toBeUndefined();
    expect(service.getRequestId()).toBeUndefined();
    expect(service.getElapsedTime()).toBeUndefined();
  });

  it('throws when a required context is missing', () => {
    expect(() => service.requireContext()).toThrow(
      'Request context is not available.',
    );
  });

  it('makes context available inside a callback', () => {
    service.run(
      {
        requestId: 'request-123',
        startedAt: performance.now(),
        method: 'GET',
      },
      () => {
        expect(service.getRequestId()).toBe('request-123');
        expect(service.requireContext().method).toBe('GET');
      },
    );
  });

  it('preserves context across asynchronous operations', async () => {
    await service.run(
      {
        requestId: 'async-request',
        startedAt: performance.now(),
        method: 'POST',
      },
      async () => {
        await setTimeout(5);

        expect(service.getRequestId()).toBe('async-request');
      },
    );
  });

  it('isolates concurrent requests', async () => {
    const first = service.run(
      {
        requestId: 'request-a',
        startedAt: performance.now(),
        method: 'GET',
      },
      async () => {
        await setTimeout(20);

        return service.getRequestId();
      },
    );

    const second = service.run(
      {
        requestId: 'request-b',
        startedAt: performance.now(),
        method: 'POST',
      },
      async () => {
        await setTimeout(5);

        return service.getRequestId();
      },
    );

    await expect(
      Promise.all([first, second]),
    ).resolves.toEqual([
      'request-a',
      'request-b',
    ]);
  });

  it('restores the outer context after a nested context', () => {
    service.run(
      {
        requestId: 'outer',
        startedAt: performance.now(),
        method: 'GET',
      },
      () => {
        service.run(
          {
            requestId: 'inner',
            startedAt: performance.now(),
            method: 'POST',
          },
          () => {
            expect(service.getRequestId()).toBe('inner');
          },
        );

        expect(service.getRequestId()).toBe('outer');
      },
    );
  });

  it('exposes elapsed request time', () => {
    service.run(
      {
        requestId: 'timed-request',
        startedAt: performance.now(),
        method: 'GET',
      },
      () => {
        expect(service.getElapsedTime()).toBeGreaterThanOrEqual(0);
      },
    );
  });
});
