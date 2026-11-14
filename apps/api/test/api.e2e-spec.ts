import type { Server } from 'node:http';

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/bootstrap/configureApplication';
import { RequestId } from '../src/common/decorators/requestId.decorator';
import { ApplicationException } from '../src/common/exception/application.exception';
import { HealthService } from '../src/health/services/health.service';

class TestCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const expectRecord = (value: unknown): Record<string, unknown> => {
  if (!isRecord(value)) {
    throw new Error('Expected response body property to be an object.');
  }

  return value;
};

@Controller('test')
class TestController {
  @Post()
  create(
    @Body() body: TestCreateDto,
    @RequestId() requestId: string,
  ): { name: string; requestId: string } {
    return {
      name: body.name,
      requestId,
    };
  }

  @Get('error')
  throwError(): never {
    throw new Error('sensitive-internal-information');
  }

  @Get('conflict')
  throwConflict(): never {
    throw new ApplicationException({
      statusCode: HttpStatus.CONFLICT,
      code: 'TEST_RESOURCE_CONFLICT',
      message: 'The resource already exists.',
    });
  }

  @Post('empty')
  @HttpCode(HttpStatus.NO_CONTENT)
  empty(): void {

  }
}

describe('API foundation (e2e)', () => {
  let app: NestExpressApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestController],
    }).compile();

    app =
      moduleRef.createNestApplication<NestExpressApplication>({
        bodyParser: false,
        logger: false,
      });

    configureApplication(app);

    await app.init();

    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health endpoints', () => {
    it('returns the versioned API health response', async () => {
      await request(server)
        .get('/api/v1/health')
        .expect(200)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({
            success: true,
            data: {
              status: 'ok',
              service: 'excel-dashboard-api',
            },
          });

          const responseBody = expectRecord(body);
          const meta = expectRecord(responseBody.meta);

          expect(typeof meta.requestId).toBe('string');
          expect(typeof meta.timestamp).toBe('string');
        });
    });

    it('returns a raw liveness response', async () => {
      await request(server)
        .get('/health/live')
        .expect(200)
        .expect({
          status: 'ok',
        });
    });

    it('returns a raw readiness response', async () => {
      await request(server)
        .get('/health/ready')
        .expect(200)
        .expect({
          status: 'ready',
        });
    });

    it('does not expose an unversioned application endpoint', async () => {
      await request(server)
        .get('/api/health')
        .expect(404);
    });
  });

  describe('Request context', () => {
    it('generates a request ID when one is not supplied', async () => {
      await request(server)
        .get('/api/v1/health')
        .expect('x-request-id', /^[a-f0-9-]{36}$/)
        .expect(200);
    });

    it('preserves a valid supplied request ID', async () => {
      await request(server)
        .post('/api/v1/test')
        .set('x-request-id', 'integration-test-123')
        .send({
          name: 'Test resource',
        })
        .expect('x-request-id', 'integration-test-123')
        .expect(201)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({
            success: true,
            data: {
              requestId: 'integration-test-123',
            },
            meta: {
              requestId: 'integration-test-123',
            },
          });
        });
    });

    it('replaces an invalid supplied request ID', async () => {
      await request(server)
        .get('/api/v1/health')
        .set('x-request-id', 'invalid request id')
        .expect('x-request-id', /^[a-f0-9-]{36}$/)
        .expect(200);
    });
  });

  describe('Validation', () => {
    it('accepts a valid DTO', async () => {
      await request(server)
        .post('/api/v1/test')
        .send({
          name: 'Sales dataset',
        })
        .expect(201)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({
            success: true,
            data: {
              name: 'Sales dataset',
            },
          });
        });
    });

    it('rejects missing required properties', async () => {
      await request(server)
        .post('/api/v1/test')
        .send({})
        .expect(400)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
            },
          });

          const responseBody = expectRecord(body);
          const error = expectRecord(responseBody.error);
          const details = error.details;

          expect(Array.isArray(details)).toBe(true);
          expect(
            Array.isArray(details) &&
              details.some(
                (detail) => isRecord(detail) && detail.field === 'name',
              ),
          ).toBe(true);
        });
    });

    it('rejects unexpected properties', async () => {
      await request(server)
        .post('/api/v1/test')
        .send({
          name: 'Sales dataset',
          unauthorizedProperty: true,
        })
        .expect(400)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
            },
          });
        });
    });

    it('rejects invalid property types', async () => {
      await request(server)
        .post('/api/v1/test')
        .send({
          name: 123,
        })
        .expect(400);
    });
  });

  describe('Body parser', () => {
    it('returns a standardized error for malformed JSON', async () => {
      await request(server)
        .post('/api/v1/test')
        .set('Content-Type', 'application/json')
        .send('{"name":')
        .expect(400)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({
            success: false,
            error: {
              code: 'INVALID_JSON',
            },
          });

          const responseBody = expectRecord(body);
          const meta = expectRecord(responseBody.meta);

          expect(typeof meta.requestId).toBe('string');
        });
    });

    it('rejects oversized JSON requests', async () => {
      await request(server)
        .post('/api/v1/test')
        .send({
          name: 'x'.repeat(1024 * 1024 + 1),
        })
        .expect(413)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({
            success: false,
            error: {
              code: 'PAYLOAD_TOO_LARGE',
            },
          });
        });
    });
  });

  describe('Exception handling', () => {
    it('standardizes unknown routes', async () => {
      await request(server)
        .get('/api/v1/non-existent')
        .expect(404)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({
            success: false,
            error: {
              code: 'NOT_FOUND',
            },
          });
        });
    });

    it('preserves application error codes', async () => {
      await request(server)
        .get('/api/v1/test/conflict')
        .expect(409)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({
            success: false,
            error: {
              code: 'TEST_RESOURCE_CONFLICT',
              message: 'The resource already exists.',
            },
          });
        });
    });

    it('does not expose internal error messages', async () => {
      await request(server)
        .get('/api/v1/test/error')
        .expect(500)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({
            success: false,
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'An unexpected error occurred.',
            },
          });

          expect(JSON.stringify(body)).not.toContain(
            'sensitive-internal-information',
          );
        });
    });

    it('does not wrap a 204 response', async () => {
      await request(server)
        .post('/api/v1/test/empty')
        .expect(204)
        .expect('');
    });
  });

  describe('Security', () => {
    it('sets security headers', async () => {
      await request(server)
        .get('/health/live')
        .expect('x-content-type-options', 'nosniff')
        .expect('x-frame-options', 'SAMEORIGIN')
        .expect('referrer-policy', 'no-referrer')
        .expect(200);
    });

    it('does not expose X-Powered-By', async () => {
      await request(server)
        .get('/health/live')
        .expect((response) => {
          expect(
            response.headers['x-powered-by'],
          ).toBeUndefined();
        });
    });

    it('allows configured browser origins', async () => {
      await request(server)
        .get('/api/v1/health')
        .set('Origin', 'http://localhost:3000')
        .expect(
          'access-control-allow-origin',
          'http://localhost:3000',
        )
        .expect(200);
    });

    it('does not allow unknown browser origins', async () => {
      await request(server)
        .get('/api/v1/health')
        .set('Origin', 'https://untrusted.example.com')
        .expect((response) => {
          expect(
            response.headers['access-control-allow-origin'],
          ).toBeUndefined();
        });
    });

    it('handles allowed CORS preflight requests', async () => {
      await request(server)
        .options('/api/v1/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set(
          'Access-Control-Request-Headers',
          'content-type,authorization',
        )
        .expect(204);
    });
  });

  describe('Readiness lifecycle', () => {
    it('returns 503 when the application is not ready', async () => {
      app.get(HealthService).markNotReady();

      await request(server)
        .get('/health/ready')
        .expect(503)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({
            success: false,
            error: {
              code: 'SERVICE_UNAVAILABLE',
            },
          });
        });

      await request(server)
        .get('/health/live')
        .expect(200);
    });
  });
});
